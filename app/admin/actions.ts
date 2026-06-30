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

export async function voidTransaction(transactionId: string, reason: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const { error } = await supabase.rpc('void_transaction', {
    p_transaction_id: transactionId,
    p_admin_id: user?.id,
    p_reason: reason
  })
  if (error) throw error
  revalidatePath('/admin/transaksi')
}