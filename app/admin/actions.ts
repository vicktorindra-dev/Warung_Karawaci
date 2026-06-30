'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addOrUpdateProduct(formData: FormData) {
  const supabase = createClient()
  const data = {
    name: formData.get('name') as string,
    price: Number(formData.get('price')),
    stock: Number(formData.get('stock')),
    unit: formData.get('unit') as string
  }
  
  const id = formData.get('id')
  if (id) {
    await supabase.from('products').update(data).eq('id', id)
  } else {
    await supabase.from('products').insert([data])
  }
  revalidatePath('/admin/produk')
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