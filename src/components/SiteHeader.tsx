import { cookies } from 'next/headers';
import { getAdmin } from '@/lib/admin-auth';
import { SESSION_COOKIE } from '@/lib/session';
import { ownerProfile } from '@/lib/profile';
import Navbar from './Navbar';

export default async function SiteHeader() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const admin = await getAdmin(token).catch(() => null);
  return <Navbar initialUser={admin ? { name: ownerProfile.name, avatar: ownerProfile.avatar } : null} />;
}
