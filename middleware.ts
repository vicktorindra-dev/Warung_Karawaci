import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ROLE_COOKIE = 'warung_role'

export async function middleware(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  if (!user && path !== '/login') {
    const res = NextResponse.redirect(new URL('/login', request.url))
    res.cookies.delete(ROLE_COOKIE)
    return res
  }

  if (user) {
    // Role jarang berubah, jadi kita cache di cookie supaya tidak query
    // tabel `profiles` di setiap perpindahan halaman (ini yang bikin lelet).
    let role = request.cookies.get(ROLE_COOKIE)?.value

    if (!role) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
      role = profile?.role
    }

    const applyRoleCookie = (res: NextResponse) => {
      if (role) res.cookies.set(ROLE_COOKIE, role, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 8 })
      return res
    }

    if (path === '/login' || path === '/') {
      return applyRoleCookie(NextResponse.redirect(new URL(role === 'admin' ? '/admin' : '/kasir', request.url)))
    }

    if (path.startsWith('/admin') && role !== 'admin') {
      return applyRoleCookie(NextResponse.redirect(new URL('/kasir', request.url)))
    }

    if (path.startsWith('/kasir') && role !== 'kasir') {
      return applyRoleCookie(NextResponse.redirect(new URL('/admin', request.url)))
    }

    return applyRoleCookie(NextResponse.next())
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}