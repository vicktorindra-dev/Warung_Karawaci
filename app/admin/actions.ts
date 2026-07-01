'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProducts() {
  const supabase = createClient()
  const { data, error } = await supabase.from('products').select('*').order('name')
  if (error) throw error
  return data
}

export async function addOrUpdateProduct(formData: FormData) {
  const supabase = createClient()
  const data = {
    name: formData.get('name') as string,
    category: (formData.get('category') as string) || 'Lainnya',
    price: Number(formData.get('price')),
    stock: Number(formData.get('stock')),
    unit: formData.get('unit') as string,
    is_active: formData.get('is_active') === 'true',
  }

  const id = formData.get('id')
  if (id) {
    const { error } = await supabase.from('products').update(data).eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase.from('products').insert([data])
    if (error) throw error
  }
  revalidatePath('/admin/produk')
  revalidatePath('/kasir')
}

export async function toggleProductActive(id: string, isActive: boolean) {
  const supabase = createClient()
  const { error } = await supabase.from('products').update({ is_active: isActive }).eq('id', id)
  if (error) throw error
  revalidatePath('/admin/produk')
  revalidatePath('/kasir')
}

export async function getTransactions() {
  const supabase = createClient()
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error

  const profileIds = new Set<string>()
  for (const t of transactions || []) {
    if (t.cashier_id) profileIds.add(t.cashier_id)
    if (t.voided_by) profileIds.add(t.voided_by)
  }

  let profilesMap: Record<string, string> = {}
  if (profileIds.size > 0) {
    const { data: profiles, error: profilesError } = await supabase.rpc('get_profile_names', {
      profile_ids: Array.from(profileIds),
    })
    if (profilesError) throw profilesError
    profilesMap = Object.fromEntries((profiles || []).map((p: any) => [p.id, p.full_name]))
  }

  return (transactions || []).map((t: any) => ({
    ...t,
    cashier_name: profilesMap[t.cashier_id] || '-',
    voided_by_name: t.voided_by ? (profilesMap[t.voided_by] || '-') : null,
  }))
}

// Detail item baru diambil saat baris transaksi dibuka (bukan sekaligus di awal),
// supaya halaman Transaksi & Void lebih ringan & cepat dimuat.
export async function getTransactionItems(transactionId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('transaction_items(*)')
    .eq('id', transactionId)
    .single()
  if (error) throw error
  return (data as any)?.transaction_items || []
}

// Khusus dashboard: query lebih ringan (tanpa detail item & tanpa join nama profil)
// karena dashboard butuh ambil banyak transaksi sekaligus (untuk grafik & rekap periode).
export async function getTransactionsForDashboard() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('transactions')
    .select('id, total_amount, status, created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

// Setting sederhana (key-value) yang tersimpan di database, dipakai supaya preferensi
// seperti range grafik keuntungan otomatis kepakai lagi tanpa perlu diatur ulang.
export async function getSetting(key: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from('app_settings').select('value').eq('key', key).maybeSingle()
  if (error) throw error
  return data?.value ?? null
}

export async function saveSetting(key: string, value: unknown) {
  const supabase = createClient()
  const { error } = await supabase.from('app_settings').upsert({ key, value, updated_at: new Date().toISOString() })
  if (error) throw error
}

export async function voidTransaction(transactionId: string, reason: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Sesi admin tidak terbaca. Silakan refresh halaman ini dan coba void lagi.')
  }

  const { error } = await supabase.rpc('void_transaction', {
    p_transaction_id: transactionId,
    p_admin_id: user.id,
    p_reason: reason
  })
  if (error) throw error
  revalidatePath('/admin/transaksi')
}