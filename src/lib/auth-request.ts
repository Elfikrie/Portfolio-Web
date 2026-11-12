import { NextResponse } from 'next/server';

export function authResponse(message: string, status = 200) {
  return NextResponse.json({ message }, { status, headers: { 'Cache-Control': 'private, no-store' } });
}

export function validateAuthRequest(request: Request) {
  const origin = request.headers.get('origin');
  // Netlify can forward requests internally over HTTP. Use its trusted deployment
  // URLs as well as the request URL; never trust arbitrary forwarded-host headers.
  const requestUrl = new URL(request.url);
  if (process.env.NODE_ENV === 'production') requestUrl.protocol = 'https:';
  const allowedOrigins = new Set([requestUrl.origin]);
  for (const value of [process.env.URL, process.env.DEPLOY_URL, process.env.DEPLOY_PRIME_URL]) {
    if (!value) continue;
    try {
      const url = new URL(value);
      if (process.env.NODE_ENV === 'production') url.protocol = 'https:';
      allowedOrigins.add(url.origin);
    } catch { /* Ignore malformed optional deployment URLs. */ }
  }
  if (origin && !allowedOrigins.has(origin)) {
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
