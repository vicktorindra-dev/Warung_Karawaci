import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = createClient()
  const { error, data } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=1&email=${encodeURIComponent(email)}`, request.url),
      { status: 303 }
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  const role = profile?.role || 'kasir'
  const destination = role === 'admin' ? '/admin' : '/kasir'

  const response = NextResponse.redirect(new URL(destination, request.url), { status: 303 })

  // Set role cookie langsung di response — tidak perlu query DB lagi di middleware
  response.cookies.set('warung_role', role, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 8,
  })

  return response
}