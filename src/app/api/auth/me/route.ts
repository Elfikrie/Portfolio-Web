import { NextRequest, NextResponse } from 'next/server';
import { getAdmin } from '@/lib/admin-auth';
import { SESSION_COOKIE } from '@/lib/session';
import { ownerProfile } from '@/lib/profile';

export async function GET(request: NextRequest) {
  try {
    const admin = await getAdmin(request.cookies.get(SESSION_COOKIE)?.value);
    return NextResponse.json({ user: admin ? { name: ownerProfile.name, avatar: ownerProfile.avatar } : null },
      { headers: { 'Cache-Control': 'private, no-store' } });
  } catch {
    return NextResponse.json({ user: null }, { status: 503, headers: { 'Cache-Control': 'private, no-store' } });
  }
}
