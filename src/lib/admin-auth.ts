import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { RowDataPacket } from 'mysql2';
import db from '@/lib/db';
import { SESSION_COOKIE, sessionKey, verifySession } from '@/lib/session';

export interface AdminUser extends RowDataPacket {
  id: number;
  username: string;
  password_hash: string;
}

// Bind sessions to the password without exposing its bcrypt hash in the JWT.
export function passwordVersion(hash: string) {
  return createHmac('sha256', sessionKey()).update(hash).digest('hex');
}

export async function getAdmin(token: string | undefined) {
  if (!token) return null;
  let session;
  try { session = await verifySession(token); } catch { return null; }
  const [users] = await db.query<AdminUser[]>(
    'SELECT id, username, password_hash FROM users WHERE id = ? LIMIT 1', [session.userId],
  );
  const user = users[0];
  if (!user) return null;
  const expected = Buffer.from(passwordVersion(user.password_hash));
  const actual = Buffer.from(session.passwordVersion);
  return expected.length === actual.length && timingSafeEqual(expected, actual) ? user : null;
}

export async function requireAdmin() {
  const user = await getAdmin((await cookies()).get(SESSION_COOKIE)?.value);
  if (!user) redirect('/login');
  return user;
}
