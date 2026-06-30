import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default function LoginPage() {
  async function handleLogin(formData: FormData) {
    'use server'
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = createClient()
    
    const { error, data } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    
    // Setelah login, ambil role dari tabel profiles lalu redirect 
    if (profile?.role === 'admin') redirect('/admin')
    else redirect('/kasir')
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <form action={handleLogin} className="p-8 bg-white rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Login Warung</h1>
        <input type="email" name="email" placeholder="Email" required className="w-full mb-4 p-2 border rounded" />
        <input type="password" name="password" placeholder="Password" required className="w-full mb-6 p-2 border rounded" />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Masuk</button>
      </form>
    </div>
  )
}