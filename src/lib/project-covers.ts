import { getStore } from '@netlify/blobs';
import { randomUUID } from 'node:crypto';
import db from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
import { prepareActivityPhoto } from '@/lib/activity-photos';

export const projectCoverKeyPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.jpg$/;
const prefix = '/api/project-images/';
export const projectCoverUrl = (key: string) => prefix + key;
export const projectCoverStore = () => getStore({ name: 'project-covers', consistency: 'strong' });

export async function readCoverUpload(form: FormData) {
  const file = form.get('coverPhoto');
  if (file === null || (file instanceof File && !file.name && !file.size)) return null;
  if (!(file instanceof File)) throw new Error('Pilih file foto cover yang valid.');
  return prepareActivityPhoto(file);
}

export async function saveProjectCover(photo: ArrayBuffer) {
  const key = randomUUID() + '.jpg';
  const result = await projectCoverStore().set(key, photo, { onlyIfNew: true });
  if (!result.modified) throw new Error('Cover belum dapat disimpan. Coba lagi.');
  return projectCoverUrl(key);
}

export async function removeUnusedProjectCover(url: string | null) {
  if (!url?.startsWith(prefix)) return;
  const key = url.slice(prefix.length);
  if (!projectCoverKeyPattern.test(key)) return;
  // Never delete external/legacy covers, or a cover still referenced by a project.
  const [rows] = await db.query<RowDataPacket[]>('SELECT id FROM projects WHERE imageUrl = ? LIMIT 1', [url]);
  if (!rows.length) await projectCoverStore().delete(key);
}
