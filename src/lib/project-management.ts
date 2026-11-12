import db from '@/lib/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { revalidatePath } from 'next/cache';
import { readCoverUpload, saveProjectCover, removeUnusedProjectCover } from '@/lib/project-covers';

function productionOnly() {
  if (process.env.CONTEXT && process.env.CONTEXT !== 'production') {
    return { success: false, message: 'Pengelolaan project hanya tersedia di website produksi.' };
  }
}

function projectFields(form: FormData) {
  const text = (key: string) => typeof form.get(key) === 'string' ? String(form.get(key)).trim() : '';
  const title = text('title'), description = text('description'), demoUrl = text('demoUrl');
  if (!title || title.length > 255) throw new Error('Judul wajib diisi, maksimal 255 karakter.');
  if (!description || description.length > 10000) throw new Error('Deskripsi wajib diisi, maksimal 10.000 karakter.');
  if (demoUrl) {
    let url;
    try { url = new URL(demoUrl); } catch { throw new Error('URL demo tidak valid.'); }
    if (!['http:', 'https:'].includes(url.protocol) || demoUrl.length > 255) throw new Error('Gunakan URL demo HTTP atau HTTPS, maksimal 255 karakter.');
  }
  const tags = text('tags').split(',').map(t => t.trim()).filter(Boolean);
  if (tags.length > 30 || tags.some(t => t.length > 100)) throw new Error('Gunakan maksimal 30 tag, masing-masing maksimal 100 karakter.');
  return { title, description, demoUrl, tags: JSON.stringify(tags) };
}

async function currentProject(id: string) {
  if (!/^[1-9]\d{0,9}$/.test(id)) return null;
  const [rows] = await db.query<RowDataPacket[]>('SELECT id, imageUrl FROM projects WHERE id = ? LIMIT 1', [id]);
  return rows[0] ? { id: rows[0].id, imageUrl: (rows[0].imageUrl ?? rows[0].imageurl ?? null) as string | null } : null;
}

function refreshProjects() {
  revalidatePath('/admin/projects');
  revalidatePath('/projects');
  revalidatePath('/');
}

export async function saveProjectRecord(form: FormData, id?: string): Promise<{ success: boolean; message?: string }> {
  const denied = productionOnly();
  if (denied) return denied;
  let newCover: string | null = null;
  try {
    const previous = id ? await currentProject(id) : null;
    if (id && !previous) return { success: false, message: 'Project tidak ditemukan.' };
    let fields, photo;
    try { fields = projectFields(form); photo = await readCoverUpload(form); }
    catch (error) { return { success: false, message: error instanceof Error ? error.message : 'Data project tidak valid.' }; }
    if (photo) newCover = await saveProjectCover(photo);
    const cover = newCover || previous?.imageUrl || null;
    const values = [fields.title, fields.description, fields.demoUrl, cover, fields.tags];
    if (previous) {
      const [result] = await db.query<ResultSetHeader>(
        'UPDATE projects SET title=?, description=?, demoUrl=?, imageUrl=?, tags=? WHERE id=? AND imageUrl <=> ?',
        [...values, id, previous.imageUrl],
      );
      if (result.affectedRows !== 1) {
        if (newCover) await removeUnusedProjectCover(newCover);
        return { success: false, message: 'Project sudah berubah. Muat ulang sebelum menyimpan.' };
      }
    } else {
      await db.query('INSERT INTO projects (title, description, demoUrl, imageUrl, tags) VALUES (?, ?, ?, ?, ?)', values);
    }
    const replaced = Boolean(newCover);
    newCover = null;
    if (replaced && previous) await removeUnusedProjectCover(previous.imageUrl).catch(() => {});
    refreshProjects();
    return { success: true };
  } catch {
    if (newCover) await removeUnusedProjectCover(newCover).catch(() => {});
    return { success: false, message: 'Project belum dapat disimpan. Silakan coba lagi.' };
  }
}

export async function deleteProjectRecord(id: string): Promise<{ success: boolean; message?: string }> {
  const denied = productionOnly();
  if (denied) return denied;
  try {
    const previous = await currentProject(id);
    if (!previous) return { success: false, message: 'Project tidak ditemukan.' };
    const [result] = await db.query<ResultSetHeader>('DELETE FROM projects WHERE id=? AND imageUrl <=> ?', [id, previous.imageUrl]);
    if (result.affectedRows !== 1) return { success: false, message: 'Project sudah berubah. Muat ulang halaman.' };
    await removeUnusedProjectCover(previous.imageUrl).catch(() => {});
    refreshProjects();
    return { success: true };
  } catch { return { success: false, message: 'Project belum dapat dihapus. Silakan coba lagi.' }; }
}
