import { NextResponse } from 'next/server';

export function authResponse(message: string, status = 200) {
  return NextResponse.json({ message }, { status, headers: { 'Cache-Control': 'private, no-store' } });
}

export function validateAuthRequest(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) {
    return authResponse('Permintaan tidak diizinkan.', 403);
  }
  if (!request.headers.get('content-type')?.startsWith('application/json')) {
    return authResponse('Format permintaan tidak valid.', 415);
  }
  return null;
}

export function validCredentials(username: unknown, password: unknown) {
  return typeof username === 'string' && username.trim().length > 0 && username.length <= 255
    && typeof password === 'string' && password.length > 0 && password.length <= 1024;
}

// Best-effort per-instance throttle, not a distributed/global rate limiter.
const attempts = new Map<string, { count: number; until: number }>();
export function tooManyAttempts(username: string) {
  const now = Date.now();
  for (const [key, value] of attempts) if (value.until <= now) attempts.delete(key);
  const key = username.trim().toLowerCase();
  const entry = attempts.get(key) ?? { count: 0, until: now + 60_000 };
  entry.count++;
  if (attempts.size >= 1000 && !attempts.has(key)) return true;
  attempts.set(key, entry);
  return entry.count > 10;
}
