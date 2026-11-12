import { NextRequest } from 'next/server';
import { getActivity } from '@/lib/activities';
import { activityPhotoStore } from '@/lib/activity-photos';
import { getAdmin } from '@/lib/admin-auth';
import { SESSION_COOKIE } from '@/lib/session';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const activity = await getActivity((await params).id);
    if (!activity || (activity.status !== 'published' && !(await getAdmin(request.cookies.get(SESSION_COOKIE)?.value)))) {
      return new Response('Not found', { status: 404, headers: { 'Cache-Control': 'no-store' } });
    }
    const image = await activityPhotoStore().get(activity.image_key, { type: 'arrayBuffer' });
    if (!image) return new Response('Not found', { status: 404 });
    return new Response(image, { headers: {
      'Content-Type': 'image/jpeg', 'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'private, no-store',
    } });
  } catch { return new Response('Image unavailable', { status: 503, headers: { 'Cache-Control': 'no-store' } }); }
}
