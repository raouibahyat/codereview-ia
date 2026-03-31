import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_ROUTES = ['/login', '/register', '/auth/callback']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Laisse passer les routes publiques
  if (PUBLIC_ROUTES.some((r) => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  // Pour les routes dashboard : vérifie le refresh cookie
  // (le vrai check du JWT se fait côté API, ici on vérifie juste la présence du cookie)
  const hasRefreshCookie = request.cookies.has('refresh_token')

  if (!hasRefreshCookie && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*'],
}