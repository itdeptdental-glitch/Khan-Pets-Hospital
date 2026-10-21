import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const origin = request.headers.get('origin')
  const allowedOrigins = (process.env.CORS_ORIGINS ?? '')
    .split(',')
    .map(value => value.trim())
    .filter(Boolean)
  const allowed = origin !== null && allowedOrigins.includes(origin)
  const preflight = request.method === 'OPTIONS' && request.headers.has('access-control-request-method')
  const response = preflight
    ? new NextResponse(null, { status: allowed ? 204 : 403 })
    : NextResponse.next()

  response.headers.append('Vary', 'Origin')
  if (allowed) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    if (preflight) {
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
      response.headers.set('Access-Control-Max-Age', '600')
    }
  }
  return response
}

export const config = {
  matcher: '/api/:path*',
}
