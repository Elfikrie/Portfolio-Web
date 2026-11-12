import db from '@/lib/db';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { revalidatePath } from 'next/cache';
import { readSkillImage, saveSkillImage, removeUnusedSkillImage } from '@/lib/skill-images';

type Result = { success: boolean; message?: string };
function productionOnly(): Result | undefined {
  if (process.env.CONTEXT && process.env.CONTEXT !== 'production') return { success: false, message: 'Pengelolaan skill hanya tersedia di website produksi.' };
}
function fields(form: FormData) {
  const name = typeof form.get('name') === 'string' ? String(form.get('name')).trim() : '';
  const level = Number(form.get('level')), type = form.get('type');
  if (!name || name.length > 100) throw new Error('Nama skill wajib diisi, maksimal 100 karakter.');
  if (!Number.isInteger(level) || level < 1 || level > 100) throw new Error('Level skill harus berupa angka 1–100.');
  if (type !== 'hard' && type !== 'soft') throw new Error('Pilih Hard Skill atau Soft Skill.');
  return { name, level, type };
}
async function currentSkill(id: string) {
  if (!/^[1-9]\d{0,9}$/.test(id)) return null;
  const [rows] = await db.query<RowDataPacket[]>('SELECT id, image_key FROM skills WHERE id = ? LIMIT 1', [id]);
  return rows[0] ? { id: rows[0].id, image_key: (rows[0].image_key ?? null) as string | null } : null;
}
function refreshSkills() {
  revalidatePath('/admin/skills'); revalidatePath('/skills'); revalidatePath('/');
}

export async function saveSkillRecord(form: FormData, id?: string): Promise<Result> {
  const denied = productionOnly(); if (denied) return denied;
  let newKey: string | null = null;
  try {
    const previous = id ? await currentSkill(id) : null;
    if (id && !previous) return { success: false, message: 'Skill tidak ditemukan.' };
    let data, photo;
    const remove = form.get('removeImage') === 'on';
    try {
      data = fields(form); photo = await readSkillImage(form);
      if (photo && remove) throw new Error('Pilih mengganti logo atau menghapusnya, bukan keduanya.');
    } catch (error) { return { success: false, message: error instanceof Error ? error.message : 'Data skill tidak valid.' }; }
    if (photo) newKey = await saveSkillImage(photo);
    const key = newKey || (remove ? null : previous?.image_key ?? null);
    const values = [data.name, data.level, data.type, key];
    if (previous) {
      const [result] = await db.query<ResultSetHeader>(
        'UPDATE skills SET name=?, level=?, type=?, image_key=? WHERE id=? AND image_key <=> ?',
        [...values, id, previous.image_key],
      );
      if (result.affectedRows !== 1) {
        if (newKey) await removeUnusedSkillImage(newKey);
        return { success: false, message: 'Skill sudah berubah. Muat ulang sebelum menyimpan.' };
      }
    } else {
      await db.query('INSERT INTO skills (name, level, type, image_key) VALUES (?, ?, ?, ?)', values);
    }
    const changedImage = Boolean(newKey) || remove;
    newKey = null;
    if (changedImage && previous) await removeUnusedSkillImage(previous.image_key).catch(() => {});
    refreshSkills();
    return { success: true };
  } catch {
    if (newKey) await removeUnusedSkillImage(newKey).catch(() => {});
    return { success: false, message: 'Skill belum dapat disimpan. Silakan coba lagi.' };
  }
}

export async function deleteSkillRecord(id: string): Promise<Result> {
  const denied = productionOnly(); if (denied) return denied;
  try {
    const previous = await currentSkill(id);
    if (!previous) return { success: false, message: 'Skill tidak ditemukan.' };
    const [result] = await db.query<ResultSetHeader>('DELETE FROM skills WHERE id=? AND image_key <=> ?', [id, previous.image_key]);
    if (result.affectedRows !== 1) return { success: false, message: 'Skill sudah berubah. Muat ulang halaman.' };
    await removeUnusedSkillImage(previous.image_key).catch(() => {});
    refreshSkills();
    return { success: true };
  } catch { return { success: false, message: 'Skill belum dapat dihapus. Silakan coba lagi.' }; }
}
