"use client";

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Activity } from '@/lib/activities';

type Entry = Pick<Activity, 'id' | 'title' | 'date' | 'description' | 'status' | 'revision'>;
export default function ActivityForm({ activity }: { activity?: Entry }) {
  const router = useRouter();
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState('');
  const [description, setDescription] = useState(activity?.description || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const inFlight = useRef(false);
  useEffect(() => {
    if (!photo) return;
    const url = URL.createObjectURL(photo);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photo]);
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    setError('');
    if (!activity && !photo) { setError('Pilih satu foto untuk kegiatan ini.'); return; }
    const data = new FormData(event.currentTarget);
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement;
    data.set('status', submitter?.value === 'draft' ? 'draft' : 'published');
    if (photo) data.set('photo', photo);
    if (activity) data.set('revision', String(activity.revision));
    inFlight.current = true; setBusy(true);
    try {
      const response = await fetch(activity ? `/api/admin/activities/${activity.id}` : '/api/admin/activities', {
        method: activity ? 'PUT' : 'POST', body: data, credentials: 'same-origin',
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.message || 'Kegiatan belum dapat disimpan.');
      router.push('/admin/activities'); router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Periksa koneksi dan coba lagi.');
      setBusy(false); inFlight.current = false;
    }
  }
  return <form onSubmit={submit} className="activity-editor" aria-busy={busy}>
    <fieldset disabled={busy} className="contents">
      <div className="activity-upload-column"><p className="editor-label">01 / FOTO KEGIATAN</p>
        <label htmlFor="activity-photo" className={`activity-upload ${(preview || activity) ? 'has-photo' : ''}`}>
          {(preview || activity) ? <img src={preview || `/api/activity-images/${activity!.id}?v=${activity!.revision}`} alt="Pratinjau foto kegiatan" /> : <div className="activity-upload-hint"><span aria-hidden="true">＋</span><strong>Pilih satu momen.</strong><p>Klik untuk mengunggah foto</p></div>}
          {(preview || activity) && <span className="activity-replace-label">Ganti foto ↗</span>}
        </label>
        <input id="activity-photo" name="photo" type="file" accept="image/jpeg,image/png,image/webp" className="activity-file-input" onChange={event => {
          const file = event.target.files?.[0];
          if (!file) return;
          if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 3 * 1024 * 1024) {
            setError('Pilih JPG, PNG, atau WebP maksimal 3 MB.'); event.target.value = ''; return;
          }
          setError(''); setPhoto(file);
        }} />
        <p className="editor-help">JPG, PNG, atau WebP · maks. 3 MB.<br />Foto dioptimalkan otomatis saat disimpan.</p>
      </div>
      <div className="activity-details-column"><p className="editor-label">02 / CERITANYA</p>
        <div className="editor-field"><label htmlFor="activity-title">Judul kegiatan</label><input id="activity-title" name="title" required maxLength={160} defaultValue={activity?.title} placeholder="Apa yang Anda lakukan hari ini?" /></div>
        <div className="editor-field"><label htmlFor="activity-date">Tanggal kegiatan</label><input id="activity-date" name="date" type="date" required min="1900-01-01" defaultValue={activity?.date || today} /></div>
        <div className="editor-field"><label htmlFor="activity-description">Deskripsi singkat</label><textarea id="activity-description" name="description" required rows={6} maxLength={1000} value={description} onChange={e => setDescription(e.target.value)} placeholder="Sedikit cerita tentang momen ini…" /><span className="editor-counter">{description.length} / 1.000</span></div>
        {error && <p role="alert" className="editor-error">{error}</p>}
        <div className="editor-actions"><button type="submit" value="draft" className="editor-button-secondary">{activity?.status === 'published' ? 'Jadikan draf' : 'Simpan draf'}</button><button type="submit" value="published" className="editor-button-primary">{busy ? 'Menyimpan…' : activity?.status === 'published' ? 'Simpan perubahan' : 'Terbitkan'} <span aria-hidden="true">↗</span></button></div>
        <p className="editor-help">Draf hanya terlihat oleh Anda. Kegiatan yang diterbitkan tampil di halaman Aktivitas.</p>
        <Link href="/admin/activities" className="journal-text-link text-sm">Batal dan kembali</Link>
      </div>
    </fieldset>
  </form>;
}
