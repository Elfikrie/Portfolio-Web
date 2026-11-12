import { getStore } from '@netlify/blobs';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';
import db from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

export const skillImageKeyPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/;
export const skillImageStore = () => getStore({ name: 'skill-images', consistency: 'strong' });

export async function readSkillImage(form: FormData) {
  const file = form.get('skillImage');
  if (file === null || (file instanceof File && !file.name && !file.size)) return null;
  if (!(file instanceof File) || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || !file.size || file.size > 3 * 1024 * 1024) {
    throw new Error('Pilih foto/logo JPG, PNG, atau WebP maksimal 3 MB.');
  }
  try {
    const source = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(source, { limitInputPixels: 25_000_000 }).metadata();
    if (!['jpeg', 'png', 'webp'].includes(metadata.format || '')) throw new Error('Invalid format');
    // Preserve alpha and the complete logo; strip metadata including GPS.
    const output = await sharp(source, { limitInputPixels: 25_000_000 }).rotate()
      .resize({ width: 512, height: 512, fit: 'inside', withoutEnlargement: true })
      .webp({ lossless: true }).toBuffer();
    return new Uint8Array(output).buffer;
  } catch { throw new Error('Foto/logo tidak dapat dibaca. Pilih file gambar lain.'); }
}

export async function saveSkillImage(photo: ArrayBuffer) {
  const key = randomUUID() + '.webp';
  const result = await skillImageStore().set(key, photo, { onlyIfNew: true });
  if (!result.modified) throw new Error('Logo belum dapat disimpan.');
  return key;
}

export async function removeUnusedSkillImage(key: string | null) {
  if (!key || !skillImageKeyPattern.test(key)) return;
  const [rows] = await db.query<RowDataPacket[]>('SELECT id FROM skills WHERE image_key = ? LIMIT 1', [key]);
  if (!rows.length) await skillImageStore().delete(key);
}
