import Link from 'next/link';
import db from '@/lib/db';
import { type Activity, activityColumns, formatActivityDate } from '@/lib/activities';
import ActivityDelete from '@/components/ActivityDelete';

export default async function AdminActivities({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.min(10000, Math.max(1, parseInt((await searchParams).page || '1', 10) || 1));
  const [rows] = await db.query<Activity[]>(`SELECT ${activityColumns} FROM activities ORDER BY activity_date DESC, id DESC LIMIT 21 OFFSET ?`, [(page - 1) * 20]);
  return <div className="activity-admin-page">
    <Link href="/admin" className="journal-text-link text-sm">← Dashboard</Link>
    <div className="activity-admin-heading"><div><p className="journal-eyebrow">JURNAL PRIBADI</p><h1>Aktivitas saya<span>.</span></h1><p>Rangkai foto dan cerita. Bagikan saat Anda siap.</p></div><Link href="/admin/activities/create" className="editor-button-primary">Tambah kegiatan <span aria-hidden="true">＋</span></Link></div>
    <div className="activity-admin-toolbar"><span>{rows.length > 20 ? '20+' : rows.length} kegiatan di halaman ini</span><Link href="/activities" className="journal-text-link">Lihat halaman publik ↗</Link></div>
    {rows.length === 0 ? <div className="activity-admin-empty"><span aria-hidden="true">✳</span><h2>Cerita pertama dimulai di sini.</h2><p>Unggah sebuah foto dan tuliskan kegiatan Anda.</p><Link href="/admin/activities/create" className="journal-text-link">Buat kegiatan pertama ↗</Link></div> : <div className="activity-admin-list">{rows.slice(0, 20).map(activity => <article key={`${activity.id}-${activity.revision}`} className="activity-admin-row">
      <img src={`/api/activity-images/${activity.id}?v=${activity.revision}`} alt={activity.title} className="activity-admin-thumbnail" />
      <div className="activity-admin-row-copy"><div className="flex flex-wrap items-center gap-3"><time dateTime={activity.date}>{formatActivityDate(activity.date)}</time><span className={`activity-status ${activity.status}`}>{activity.status === 'published' ? 'Terbit' : 'Draf'}</span></div><h2>{activity.title}</h2><p>{activity.description}</p><div className="flex flex-wrap items-center gap-5 mt-4"><Link href={`/admin/activities/${activity.id}/edit`} className="journal-text-link text-sm">Edit kegiatan ↗</Link><ActivityDelete id={activity.id} revision={activity.revision} /></div></div>
    </article>)}</div>}
    {(page > 1 || rows.length > 20) && <nav aria-label="Halaman pengelolaan aktivitas" className="journal-pagination">{page > 1 && <Link href={`/admin/activities?page=${page - 1}`}>← Sebelumnya</Link>}<span>Halaman {page}</span>{rows.length > 20 && <Link href={`/admin/activities?page=${page + 1}`}>Berikutnya →</Link>}</nav>}
  </div>;
}
