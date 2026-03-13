import { NextRequest, NextResponse } from 'next/server'

function unauthorized() {
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Lounge"' },
  })
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const protectedPaths = ['/handoffs', '/ops']
  const isProtected = protectedPaths.some(p => pathname === p || pathname.startsWith(p + '/'))
  if (!isProtected) return NextResponse.next()

  const user = process.env.BASIC_AUTH_USER
  const pass = process.env.BASIC_AUTH_PASS
  if (!user || !pass) {
    return unauthorized()
  }

  const auth = req.headers.get('authorization')
  if (!auth?.startsWith('Basic ')) return unauthorized()

  const base64 = auth.split(' ')[1]
  const decoded = atob(base64)
  const [u, p] = decoded.split(':')
  if (u !== user || p !== pass) return unauthorized()

  return NextResponse.next()
}

export const config = {
  matcher: ['/handoffs', '/handoffs/:path*', '/ops', '/ops/:path*'],
}
