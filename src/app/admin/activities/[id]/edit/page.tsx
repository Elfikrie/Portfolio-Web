import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getActivity } from '@/lib/activities';
import ActivityForm from '@/components/ActivityForm';

export default async function EditActivity({ params }: { params: Promise<{ id: string }> }) {
  const activity = await getActivity((await params).id);
  if (!activity) notFound();
  return <div className="activity-admin-page"><Link href="/admin/activities" className="journal-text-link text-sm">← Semua kegiatan</Link><div className="activity-admin-heading"><div><p className="journal-eyebrow">EDIT CATATAN</p><h1>Lengkapi ceritanya<span>.</span></h1></div></div><ActivityForm activity={{ id: activity.id, title: activity.title, date: activity.date, description: activity.description, status: activity.status, revision: activity.revision }} /></div>;
}
