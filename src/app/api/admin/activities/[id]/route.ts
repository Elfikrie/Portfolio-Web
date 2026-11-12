import { NextRequest } from 'next/server';
import type { ResultSetHeader } from 'mysql2';
import db from '@/lib/db';
import { activityInput, getActivity } from '@/lib/activities';
import { activityResponse, activityWriteGuard, refreshActivities } from '@/lib/activity-api';
import { prepareActivityPhoto, saveActivityPhoto, removeActivityPhoto } from '@/lib/activity-photos';

type Context = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, context: Context) {
  let newKey: string | undefined;
  try {
    const denied = await activityWriteGuard(request);
    if (denied) return denied;
    const { id } = await context.params;
    const previous = await getActivity(id);
    if (!previous) return activityResponse({ message: 'Kegiatan tidak ditemukan.' }, 404);
    if (Number(request.headers.get('content-length')) > 4 * 1024 * 1024) return activityResponse({ message: 'Unggahan terlalu besar.' }, 413);
    let fields, revision, photo;
    try {
      const form = await request.formData();
      fields = activityInput(form);
      revision = Number(form.get('revision'));
      if (!Number.isSafeInteger(revision) || revision < 1) throw new Error('Versi kegiatan tidak valid.');
      const file = form.get('photo');
      if (file instanceof File && file.size) photo = await prepareActivityPhoto(file);
    } catch (error) { return activityResponse({ message: error instanceof Error ? error.message : 'Data tidak valid.' }, 400); }
    if (photo) newKey = await saveActivityPhoto(photo);
    const [result] = await db.execute<ResultSetHeader>(
      'UPDATE activities SET title=?, activity_date=?, description=?, image_key=?, status=?, revision=revision+1 WHERE id=? AND revision=?',
      [fields.title, fields.date, fields.description, newKey || previous.image_key, fields.status, id, revision],
    );
    if (result.affectedRows !== 1) {
      if (newKey) await removeActivityPhoto(newKey).catch(() => {});
      return activityResponse({ message: 'Kegiatan sudah berubah di tab lain. Muat ulang sebelum menyimpan.' }, 409);
    }
    const replacedPhoto = Boolean(newKey);
    newKey = undefined;
    if (replacedPhoto) await removeActivityPhoto(previous.image_key).catch(() => {});
    refreshActivities();
    return activityResponse({ message: 'Perubahan berhasil disimpan.' });
  } catch {
    if (newKey) await removeActivityPhoto(newKey).catch(() => {});
    return activityResponse({ message: 'Perubahan belum dapat disimpan. Silakan coba lagi.' }, 503);
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    const denied = await activityWriteGuard(request, 'application/json');
    if (denied) return denied;
    const { id } = await context.params;
    const previous = await getActivity(id);
    if (!previous) return activityResponse({ message: 'Kegiatan tidak ditemukan.' }, 404);
    const body = await request.json().catch(() => null);
    if (!Number.isSafeInteger(body?.revision) || body.revision < 1) return activityResponse({ message: 'Versi kegiatan tidak valid.' }, 400);
    const [result] = await db.execute<ResultSetHeader>('DELETE FROM activities WHERE id=? AND revision=?', [id, body.revision]);
    if (result.affectedRows !== 1) return activityResponse({ message: 'Kegiatan sudah berubah. Muat ulang halaman.' }, 409);
    await removeActivityPhoto(previous.image_key).catch(() => {});
    refreshActivities();
    return activityResponse({ message: 'Kegiatan dihapus.' });
  } catch { return activityResponse({ message: 'Kegiatan belum dapat dihapus.' }, 503); }
}
