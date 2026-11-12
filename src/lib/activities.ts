import type { RowDataPacket } from 'mysql2';
import db from '@/lib/db';

export interface Activity extends RowDataPacket {
  id: number; title: string; date: string; description: string;
  image_key: string; status: 'draft' | 'published'; revision: number;
}
export const activityColumns = "id, title, DATE_FORMAT(activity_date, '%Y-%m-%d') AS date, description, image_key, status, revision";

export async function getActivity(id: string) {
  if (!/^[1-9]\d{0,9}$/.test(id)) return null;
  const [rows] = await db.query<Activity[]>(`SELECT ${activityColumns} FROM activities WHERE id = ?`, [id]);
  return rows[0] ?? null;
}

export function activityInput(form: FormData) {
  const title = String(form.get('title') || '').trim();
  const date = String(form.get('date') || '');
  const description = String(form.get('description') || '').trim();
  const status = form.get('status');
  if (!title || title.length > 160) throw new Error('Judul wajib diisi, maksimal 160 karakter.');
  if (!description || description.length > 1000) throw new Error('Deskripsi wajib diisi, maksimal 1.000 karakter.');
  const parsed = new Date(date + 'T12:00:00Z');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number(date.slice(0, 4)) < 1900
    || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) {
    throw new Error('Tanggal kegiatan tidak valid.');
  }
  if (status !== 'draft' && status !== 'published') throw new Error('Status kegiatan tidak valid.');
  return { title, date, description, status };
}

export function formatActivityDate(date: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(date + 'T12:00:00Z'));
}
