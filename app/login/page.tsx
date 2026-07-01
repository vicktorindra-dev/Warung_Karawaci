import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default function LoginPage({ searchParams }: { searchParams?: { error?: string; email?: string } }) {
  async function handleLogin(formData: FormData) {
    'use server'
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const supabase = createClient()

    const { error, data } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      // Jangan throw langsung — redirect balik ke halaman login dengan pesan error
      // yang ramah, supaya user tidak lihat "Unhandled Runtime Error" mentah.
      redirect(`/login?error=1&email=${encodeURIComponent(email)}`)
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()

    // Setelah login, ambil role dari tabel profiles lalu redirect
    if (profile?.role === 'admin') redirect('/admin')
    else redirect('/kasir')
  }

  const hasError = searchParams?.error === '1'

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <form action={handleLogin} className="p-8 bg-white rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Login Warung</h1>

        {hasError && (
          <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
            Email atau password salah. Silakan coba lagi.
          </div>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          defaultValue={searchParams?.email || ''}
          required
          className="w-full mb-4 p-2 border rounded"
        />
        <input type="password" name="password" placeholder="Password" required className="w-full mb-6 p-2 border rounded" />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Masuk</button>
      </form>
    </div>
  )
}