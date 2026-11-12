import { NextRequest, NextResponse } from 'next/server';
import { getAdmin } from '@/lib/admin-auth';
import { SESSION_COOKIE } from '@/lib/session';
import { validateAuthRequest } from '@/lib/auth-request';
import { revalidatePath } from 'next/cache';

export function activityResponse(data: object, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
}
export async function activityWriteGuard(request: NextRequest, contentType = 'multipart/form-data') {
  if (!request.headers.get('origin')) return activityResponse({ message: 'Asal permintaan tidak valid.' }, 403);
  const invalid = validateAuthRequest(request, contentType);
  if (invalid) return invalid;
  if (process.env.CONTEXT && process.env.CONTEXT !== 'production') {
    return activityResponse({ message: 'Pengelolaan aktivitas hanya tersedia di website produksi.' }, 403);
  }
  if (!(await getAdmin(request.cookies.get(SESSION_COOKIE)?.value))) {
    return activityResponse({ message: 'Sesi berakhir. Silakan login kembali.' }, 401);
  }
  return null;
}
export function refreshActivities() {
  revalidatePath('/activities');
  revalidatePath('/admin/activities');
}
