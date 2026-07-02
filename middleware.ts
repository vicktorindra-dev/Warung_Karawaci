import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const ROLE_COOKIE = 'warung_role'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Supabase client khusus middleware — baca/tulis cookie dari request & response
  // langsung, bukan pakai cookies() dari next/headers (itu untuk Server Components).
  // Ini yang bikin session refresh berjalan benar dan mencegah error fetch failed.
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Verifikasi session — wajib untuk keamanan, tidak bisa di-skip
  const { data: { user } } = await supabase.auth.getUser()

  if (!user && path !== '/login') {
    const res = NextResponse.redirect(new URL('/login', request.url))
    res.cookies.delete(ROLE_COOKIE)
    return res
  }

  if (user) {
    // Baca role dari cookie — tidak perlu query DB tiap request
    let role = request.cookies.get(ROLE_COOKIE)?.value

    if (!role) {
      // Hanya query DB sekali saat cookie belum ada (pertama login atau expired)
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      role = profile?.role
    }

    const applyRoleCookie = (res: NextResponse) => {
      if (role) res.cookies.set(ROLE_COOKIE, role, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 8
      })
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

    return applyRoleCookie(response)
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}