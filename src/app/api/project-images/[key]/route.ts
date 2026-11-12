import db from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
import { projectCoverKeyPattern, projectCoverStore, projectCoverUrl } from '@/lib/project-covers';

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const headers = { 'Cache-Control': 'no-store' };
  if (!projectCoverKeyPattern.test(key)) return new Response('Not found', { status: 404, headers });
  try {
    // Covers become public only when attached to a saved, public portfolio project.
    const [rows] = await db.query<RowDataPacket[]>('SELECT id FROM projects WHERE imageUrl = ? LIMIT 1', [projectCoverUrl(key)]);
    if (!rows.length) return new Response('Not found', { status: 404, headers });
    const photo = await projectCoverStore().get(key, { type: 'arrayBuffer' });
    if (!photo) return new Response('Not found', { status: 404, headers });
    return new Response(photo, { headers: { ...headers, 'Content-Type': 'image/jpeg', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return new Response('Image unavailable', { status: 503, headers }); }
}
