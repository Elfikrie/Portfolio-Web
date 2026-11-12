import db from '@/lib/db';
import type { RowDataPacket } from 'mysql2';
import { skillImageKeyPattern, skillImageStore } from '@/lib/skill-images';

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const headers = { 'Cache-Control': 'no-store' };
  if (!skillImageKeyPattern.test(key)) return new Response('Not found', { status: 404, headers });
  try {
    const [rows] = await db.query<RowDataPacket[]>('SELECT id FROM skills WHERE image_key = ? LIMIT 1', [key]);
    if (!rows.length) return new Response('Not found', { status: 404, headers });
    const image = await skillImageStore().get(key, { type: 'arrayBuffer' });
    if (!image) return new Response('Not found', { status: 404, headers });
    return new Response(image, { headers: { ...headers, 'Content-Type': 'image/webp', 'X-Content-Type-Options': 'nosniff' } });
  } catch { return new Response('Image unavailable', { status: 503, headers }); }
}
