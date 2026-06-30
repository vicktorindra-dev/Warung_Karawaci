import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function middleware(request: NextRequest) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  if (!user && path !== '/login') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    console.log("DEBUG ROLE:", profile?.role); // Tambahkan baris ini
    const role = profile?.role

    if (path === '/login' || path === '/') {
      return NextResponse.redirect(new URL(role === 'admin' ? '/admin' : '/kasir', request.url))
    }

    if (path.startsWith('/admin') && role !== 'admin') {
      return NextResponse.redirect(new URL('/kasir', request.url))
    }

    if (path.startsWith('/kasir') && role !== 'kasir') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}