import bcrypt from 'bcrypt';
import db from '@/lib/db';
import { type AdminUser, passwordVersion } from '@/lib/admin-auth';
import { createSession, sessionKey, SESSION_COOKIE, SESSION_SECONDS, sessionCookieOptions } from '@/lib/session';
import { authResponse, validateAuthRequest, validCredentials, tooManyAttempts } from '@/lib/auth-request';

export async function POST(request: Request) {
  const invalid = validateAuthRequest(request);
  if (invalid) return invalid;
  const body = await request.json().catch(() => null);
  if (!body || !validCredentials(body.username, body.password)) {
    return authResponse('Isi username dan password dengan benar.', 400);
  }
  const { username, password } = body as { username: string; password: string };
  if (tooManyAttempts(username)) return authResponse('Terlalu banyak percobaan. Tunggu satu menit.', 429);
  try { sessionKey(); } catch {
    return authResponse('Konfigurasi login belum siap. Hubungi pengelola website.', 503);
  }
  try {
    const [users] = await db.query<AdminUser[]>(
      'SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1', [username.trim()],
    );
    const user = users[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return authResponse('Username atau password salah.', 401);
    }
    const token = await createSession(user.id, passwordVersion(user.password_hash));
    const response = authResponse('Login berhasil.');
    response.cookies.set(SESSION_COOKIE, token, { ...sessionCookieOptions, maxAge: SESSION_SECONDS });
    return response;
  } catch {
    console.error('Admin login unavailable');
    return authResponse('Layanan login sedang tidak tersedia. Silakan coba lagi.', 503);
  }
}
