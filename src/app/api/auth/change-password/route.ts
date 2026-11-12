import bcrypt from 'bcrypt';
import type { ResultSetHeader } from 'mysql2';
import db from '@/lib/db';
import type { AdminUser } from '@/lib/admin-auth';
import { SESSION_COOKIE, sessionCookieOptions } from '@/lib/session';
import { authResponse, validateAuthRequest, validCredentials, tooManyAttempts } from '@/lib/auth-request';

export async function POST(request: Request) {
  const invalid = validateAuthRequest(request);
  if (invalid) return invalid;
  const body = await request.json().catch(() => null);
  if (!body || !validCredentials(body.username, body.currentPassword)
    || typeof body.newPassword !== 'string' || typeof body.confirmPassword !== 'string') {
    return authResponse('Lengkapi semua kolom dengan benar.', 400);
  }
  const { username, currentPassword, newPassword, confirmPassword } = body as Record<string, string>;
  if (newPassword.length < 12 || Buffer.byteLength(newPassword, 'utf8') > 72) {
    return authResponse('Password baru minimal 12 karakter dan maksimal 72 byte.', 400);
  }
  if (newPassword !== confirmPassword) return authResponse('Konfirmasi password belum sama.', 400);
  if (tooManyAttempts(username)) return authResponse('Terlalu banyak percobaan. Tunggu satu menit.', 429);
  try {
    const [users] = await db.query<AdminUser[]>(
      'SELECT id, username, password_hash FROM users WHERE username = ? LIMIT 1', [username.trim()],
    );
    const user = users[0];
    if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) {
      return authResponse('Username atau password lama salah.', 401);
    }
    if (await bcrypt.compare(newPassword, user.password_hash)) {
      return authResponse('Password baru harus berbeda dari password lama.', 400);
    }
    const hash = await bcrypt.hash(newPassword, 12);
    // Prevent an older concurrent request overwriting a newer password.
    const [result] = await db.execute<ResultSetHeader>(
      'UPDATE users SET password_hash = ? WHERE id = ? AND password_hash = ?',
      [hash, user.id, user.password_hash],
    );
    if (result.affectedRows !== 1) return authResponse('Password telah berubah. Silakan coba lagi.', 409);
    const response = authResponse('Password berhasil diubah. Silakan login dengan password baru.');
    response.cookies.set(SESSION_COOKIE, '', { ...sessionCookieOptions, maxAge: 0 });
    return response;
  } catch {
    console.error('Admin password change unavailable');
    return authResponse('Password belum dapat diubah. Silakan coba lagi.', 503);
  }
}
