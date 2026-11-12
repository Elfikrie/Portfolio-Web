import { NextResponse } from 'next/server';
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/session';

export async function POST() {
  const response = NextResponse.json({ message: 'Logout successful' }, { status: 200 });
  
  response.headers.set('Cache-Control', 'private, no-store');
  response.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions, maxAge: 0 });
  
  return response;
}
