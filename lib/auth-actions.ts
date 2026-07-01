'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  cookies().delete('warung_role')
  redirect('/login')
}