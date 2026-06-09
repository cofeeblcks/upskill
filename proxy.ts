import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  const session = request.cookies.get('upskill-session')
  const { pathname } = request.nextUrl

  const protectedPaths = ['/admin', '/dashboard', '/supervisor']
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (!session && isProtected) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (session) {
    try {
      const { role } = JSON.parse(session.value) as { role: string }

      if (pathname === '/') {
        return NextResponse.redirect(new URL(roleToPath(role), request.url))
      }

      if (pathname.startsWith('/admin') && role !== 'ADMIN_HR') {
        return NextResponse.redirect(new URL(roleToPath(role), request.url))
      }
      if (pathname.startsWith('/supervisor') && role !== 'SUPERVISOR') {
        return NextResponse.redirect(new URL(roleToPath(role), request.url))
      }
      if (pathname.startsWith('/dashboard') && role !== 'EMPLOYEE') {
        return NextResponse.redirect(new URL(roleToPath(role), request.url))
      }
    } catch {
      const response = NextResponse.redirect(new URL('/', request.url))
      response.cookies.delete('upskill-session')
      return response
    }
  }

  return NextResponse.next()
}

function roleToPath(role: string): string {
  switch (role) {
    case 'ADMIN_HR':
      return '/admin'
    case 'SUPERVISOR':
      return '/supervisor'
    default:
      return '/dashboard'
  }
}

export const config = {
  matcher: ['/', '/admin/:path*', '/dashboard/:path*', '/supervisor/:path*'],
}
