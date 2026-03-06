import { NextResponse } from 'next/server'

export function middleware(request) {
  const refreshToken = request.cookies.get('refreshToken')?.value
  const userId = request.cookies.get('userId')?.value

  if (refreshToken && userId) {
    return NextResponse.next()
  }

  if (request.nextUrl.pathname === '/') {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL('/', request.url))
}

export const config = {
  matcher: ['/user/:path*', '/thank-you', '/checkout']
}
