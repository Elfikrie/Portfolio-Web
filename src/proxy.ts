import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, sessionCookieOptions, verifySession } from '@/lib/session';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  try {
    if (!token) throw new Error('No session');
    await verifySession(token);
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'private, no-store');
    return response;
  } catch {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.headers.set('Cache-Control', 'private, no-store');
    response.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions, maxAge: 0 });
    return response;
  }
}

export const config = { matcher: ['/admin/:path*'] };
