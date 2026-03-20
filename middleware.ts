import { NextRequest, NextResponse } from 'next/server'

function forbidden() {
  return new NextResponse('Forbidden', { status: 403 })
}

const allowedCidrs = [
  '100.64.0.0/10', // Tailscale
  '192.168.1.0/24', // LAN
  '127.0.0.0/8', // localhost
]

function ipToInt(ip: string) {
  return ip.split('.').reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0
}

function cidrContains(cidr: string, ip: string) {
  const [range, bitsStr] = cidr.split('/')
  const bits = parseInt(bitsStr, 10)
  if (!Number.isFinite(bits)) return false
  const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0
  return (ipToInt(ip) & mask) === (ipToInt(range) & mask)
}

function getClientIp(req: NextRequest) {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  const realIp = req.headers.get('x-real-ip')
  if (realIp) return realIp.trim()
  return ''
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const protectedPaths = ['/handoffs', '/ops', '/info', '/lounge', '/war-room', '/api/handoffs']
  const isProtected = protectedPaths.some(p => pathname === p || pathname.startsWith(p + '/'))
  if (!isProtected) return NextResponse.next()

  const ip = getClientIp(req)
  if (!ip || !/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) return forbidden()

  const allowed = allowedCidrs.some(cidr => cidrContains(cidr, ip))
  if (!allowed) return forbidden()

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/handoffs',
    '/handoffs/:path*',
    '/ops',
    '/ops/:path*',
    '/info',
    '/info/:path*',
    '/lounge',
    '/lounge/:path*',
    '/war-room',
    '/war-room/:path*',
    '/api/handoffs',
    '/api/handoffs/:path*',
  ],
}
