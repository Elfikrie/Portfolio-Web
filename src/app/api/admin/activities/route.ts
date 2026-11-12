import { NextRequest } from 'next/server';
import type { ResultSetHeader } from 'mysql2';
import db from '@/lib/db';
import { activityInput } from '@/lib/activities';
import { activityResponse, activityWriteGuard, refreshActivities } from '@/lib/activity-api';
import { prepareActivityPhoto, saveActivityPhoto, removeActivityPhoto } from '@/lib/activity-photos';

export async function POST(request: NextRequest) {
  let newKey: string | undefined;
  try {
    const denied = await activityWriteGuard(request);
    if (denied) return denied;
    if (Number(request.headers.get('content-length')) > 4 * 1024 * 1024) return activityResponse({ message: 'Unggahan terlalu besar.' }, 413);
    let fields, photo;
    try {
      const form = await request.formData();
      fields = activityInput(form);
      const file = form.get('photo');
      if (!(file instanceof File) || !file.size) throw new Error('Pilih foto untuk kegiatan ini.');
      photo = await prepareActivityPhoto(file);
    } catch (error) { return activityResponse({ message: error instanceof Error ? error.message : 'Data tidak valid.' }, 400); }
    newKey = await saveActivityPhoto(photo);
    const [result] = await db.execute<ResultSetHeader>(
      'INSERT INTO activities (title, activity_date, description, image_key, status) VALUES (?, ?, ?, ?, ?)',
      [fields.title, fields.date, fields.description, newKey, fields.status],
    );
    newKey = undefined;
    refreshActivities();
    return activityResponse({ id: result.insertId, message: fields.status === 'published' ? 'Kegiatan berhasil diterbitkan.' : 'Draf berhasil disimpan.' }, 201);
  } catch (error) {
    if (newKey) await removeActivityPhoto(newKey).catch(() => {});
    console.error('Activity creation failed', error instanceof Error ? error.name : 'unknown');
    return activityResponse({ message: 'Kegiatan belum dapat disimpan. Silakan coba lagi.' }, 503);
  }
}
