'use server'
import { createClient } from '@/lib/supabase/server'

export async function getActiveProducts() {
  const supabase = createClient()
  const { data, error } = await supabase.from('products').select('*').eq('is_active', true).gt('stock', 0)
  if (error) throw error
  return data
}

export async function getMyTransactions() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('transactions')
    .select('*, transaction_items(*)')
    .eq('cashier_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error

  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
  const cashierName = profile?.full_name || '-'

  return (data || []).map((t: any) => ({ ...t, cashier_name: cashierName }))
}

export async function submitTransaction(totalAmount: number, items: any[]) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase.rpc('process_transaction', {
    p_cashier_id: user.id,
    p_total_amount: totalAmount,
    p_items: items 
  })

  if (error) throw error
  return data 
}