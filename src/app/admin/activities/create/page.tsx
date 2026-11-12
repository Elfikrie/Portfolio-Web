import Link from 'next/link';
import ActivityForm from '@/components/ActivityForm';

export default function CreateActivity() {
  return <div className="activity-admin-page"><Link href="/admin/activities" className="journal-text-link text-sm">← Semua kegiatan</Link><div className="activity-admin-heading"><div><p className="journal-eyebrow">CATATAN BARU</p><h1>Simpan sebuah momen<span>.</span></h1><p>Tak harus besar. Hal sederhana pun layak diceritakan.</p></div></div><ActivityForm /></div>;
}
