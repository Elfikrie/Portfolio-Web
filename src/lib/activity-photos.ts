import { getStore } from '@netlify/blobs';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

export function activityPhotoStore() {
  return getStore({ name: 'activity-photos', consistency: 'strong' });
}

export async function prepareActivityPhoto(file: File) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size === 0 || file.size > 3 * 1024 * 1024) {
    throw new Error('Gunakan foto JPG, PNG, atau WebP maksimal 3 MB.');
  }
  try {
    const source = Buffer.from(await file.arrayBuffer());
    const metadata = await sharp(source, { limitInputPixels: 25_000_000 }).metadata();
    if (!['jpeg', 'png', 'webp'].includes(metadata.format || '')) throw new Error('Invalid format');
    // Decode/re-encode and strip EXIF (including GPS); never serve the uploaded original.
    const photo = await sharp(source, { limitInputPixels: 25_000_000 }).rotate()
      .resize({ width: 1800, height: 1800, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 84, mozjpeg: true }).toBuffer();
    return new Uint8Array(photo).buffer;
  } catch { throw new Error('Foto tidak dapat dibaca. Coba foto JPG, PNG, atau WebP lain.'); }
}

export async function saveActivityPhoto(photo: ArrayBuffer) {
  const key = randomUUID() + '.jpg';
  await activityPhotoStore().set(key, photo, { onlyIfNew: true });
  return key;
}

export async function removeActivityPhoto(key: string) {
  if (!/^[a-f0-9-]{36}\.jpg$/.test(key)) return;
  await activityPhotoStore().delete(key);
}
