import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE = 'admin_token';
export const SESSION_SECONDS = 60 * 60 * 24;
export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
};

export function sessionKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret || new TextEncoder().encode(secret).length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 bytes');
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(userId: number, passwordVersion: string) {
  return new SignJWT({ passwordVersion })
    .setProtectedHeader({ alg: 'HS256' }).setSubject(String(userId))
    .setIssuer('portfolio-admin').setAudience('portfolio-admin')
    .setIssuedAt().setExpirationTime('24h').sign(sessionKey());
}

export async function verifySession(token: string) {
  const { payload } = await jwtVerify(token, sessionKey(), {
    algorithms: ['HS256'], issuer: 'portfolio-admin', audience: 'portfolio-admin',
    requiredClaims: ['sub', 'iat', 'exp'],
  });
  if (!payload.sub || !/^\d+$/.test(payload.sub) || typeof payload.passwordVersion !== 'string') {
    throw new Error('Invalid session');
  }
  return { userId: payload.sub, passwordVersion: payload.passwordVersion };
}
