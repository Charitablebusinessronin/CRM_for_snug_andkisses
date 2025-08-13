import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Feature-flagged role redirect middleware (disabled by default)
export function middleware(req: NextRequest) {
  const enabled = process.env.NEXT_PUBLIC_ENABLE_ROLE_REDIRECTS === 'true'
  if (!enabled) return NextResponse.next()

  const url = req.nextUrl.clone()
  const sessionRole = req.headers.get('x-user-role') // placeholder; wire to NextAuth if needed

  if (!sessionRole) return NextResponse.next()

  if (url.pathname === '/' || url.pathname === '/login') {
    switch (sessionRole) {
      case 'admin':
        url.pathname = '/admin/dashboard'; return NextResponse.redirect(url)
      case 'employee':
        url.pathname = '/employee/dashboard'; return NextResponse.redirect(url)
      case 'contractor':
        url.pathname = '/contractor/dashboard'; return NextResponse.redirect(url)
      case 'client':
        url.pathname = '/client/dashboard'; return NextResponse.redirect(url)
      default:
        return NextResponse.next()
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/','/login']
}
