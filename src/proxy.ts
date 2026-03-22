import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const secretKey = new TextEncoder().encode(process.env.JWT_SECRET || 'super_secret_jwt_key_fikrie_2026_portfolio');
    await jwtVerify(token, secretKey);
    return NextResponse.next();
  } catch (error) {
    // Token is invalid or expired
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('admin_token');
    return response;
  }
}

export const config = {
  matcher: ['/admin/:path*'], // Protects all admin routes
};
