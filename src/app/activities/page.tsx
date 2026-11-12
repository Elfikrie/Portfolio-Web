import Link from 'next/link';
import type { RowDataPacket } from 'mysql2';
import db from '@/lib/db';
import { type Activity, activityColumns, formatActivityDate } from '@/lib/activities';
import Reveal from '@/components/Reveal';

export const metadata = { title: 'Aktivitas — Fikrie', description: 'Catatan kegiatan, pertemuan, dan cerita sehari-hari Fikrie.' };
export const dynamic = 'force-dynamic';

export default async function ActivitiesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const page = Math.min(10000, Math.max(1, Number.parseInt(params.page || '1', 10) || 1));
  let activities: Activity[] = [], count = 0, unavailable = false;
  try {
    const [rows] = await db.query<Activity[]>(`SELECT ${activityColumns} FROM activities WHERE status='published' ORDER BY activity_date DESC, id DESC LIMIT 13 OFFSET ?`, [(page - 1) * 12]);
    activities = rows;
    const [totals] = await db.query<RowDataPacket[]>("SELECT COUNT(*) AS total FROM activities WHERE status='published'");
    count = Number(totals[0].total);
  } catch { unavailable = true; }
  const hasNext = activities.length > 12;
  const visible = activities.slice(0, 12);
  const featured = page === 1 ? visible[0] : undefined;
  const rest = featured ? visible.slice(1) : visible;

  return (
    <div className="journal-page">
      <section className="journal-intro">
        <div className="journal-eyebrow"><span className="journal-dot" /> CATATAN KEGIATAN <span className="ml-auto hidden sm:inline">OLEH FIKRIE</span></div>
        <div className="journal-title-row">
          <h1>Di luar<span>layar.</span></h1>
          <div className="journal-intro-aside"><span aria-hidden="true" className="journal-asterisk">✳</span><p>Kegiatan, pertemuan, dan hal-hal kecil yang ingin saya simpan.</p></div>
        </div>
        <div className="journal-index"><span>SEBUAH JURNAL PRIBADI</span><span>{String(count).padStart(2, '0')} CERITA</span></div>
      </section>

      {unavailable ? <div role="status" className="journal-empty"><h2>Jurnal sedang beristirahat.</h2><p>Cerita belum bisa dimuat. Silakan kembali sebentar lagi.</p></div> : visible.length === 0 ? (
        <section className="journal-empty">
          <div className="journal-empty-art" aria-hidden="true"><div /><div /><svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.3"><path d="M7 15h10l3-5h10l3 5h8v23H7z"/><circle cx="24" cy="26" r="7"/><path d="M35 20h2"/></svg></div>
          <p className="journal-eyebrow justify-center">HALAMAN PERTAMA</p>
          <h2>Ruang untuk cerita berikutnya.</h2><p>Belum ada kegiatan yang dibagikan di sini.<br />Nanti, satu per satu akan menjadi kenangan.</p>
          <Link href={page > 1 ? '/activities' : '/'} className="journal-text-link">{page > 1 ? 'Ke halaman pertama' : 'Kembali ke beranda'} <span aria-hidden="true">↗</span></Link>
        </section>
      ) : <>
        {featured && <Reveal><article className="journal-featured">
          <div className="journal-photo"><img src={`/api/activity-images/${featured.id}?v=${featured.revision}`} alt={featured.title} fetchPriority="high" /><span className="journal-photo-caption">CATATAN TERBARU ↗</span></div>
          <div className="journal-featured-copy"><time dateTime={featured.date}>{formatActivityDate(featured.date)}</time><h2>{featured.title}</h2><p>{featured.description}</p><span aria-hidden="true" className="journal-entry-mark">01 /</span></div>
        </article></Reveal>}
        {rest.length > 0 && <div className="journal-archive"><div className="journal-section-label"><h2>Cerita lainnya</h2><span aria-hidden="true">↓</span></div><div className="journal-grid">
          {rest.map((activity, index) => <Reveal key={activity.id} delay={(index % 3) * 60}><article className="journal-card">
            <div className="journal-photo"><img src={`/api/activity-images/${activity.id}?v=${activity.revision}`} alt={activity.title} loading="lazy" /></div>
            <div className="journal-card-meta"><time dateTime={activity.date}>{formatActivityDate(activity.date)}</time><span>{String((page - 1) * 12 + index + (featured ? 2 : 1)).padStart(2, '0')}</span></div>
            <h3>{activity.title}</h3><p>{activity.description}</p>
          </article></Reveal>)}
        </div></div>}
        {(page > 1 || hasNext) && <nav aria-label="Halaman aktivitas" className="journal-pagination">{page > 1 && <Link href={`/activities?page=${page - 1}`}>← Sebelumnya</Link>}<span>Halaman {page}</span>{hasNext && <Link href={`/activities?page=${page + 1}`}>Berikutnya →</Link>}</nav>}
      </>}
      <div className="journal-endnote"><span>Terus berjalan. Terus mencatat.</span><span aria-hidden="true">F.</span></div>
    </div>
  );
}
