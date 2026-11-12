"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ActivityDelete({ id, revision }: { id: number; revision: number }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function remove() {
    setBusy(true); setError('');
    try {
      const response = await fetch(`/api/admin/activities/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revision }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Gagal menghapus kegiatan.');
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : 'Periksa koneksi.'); setBusy(false); }
  }
  return <div className="activity-delete">
    {!confirm ? <button onClick={() => setConfirm(true)} className="text-zinc-500 hover:text-red-300 text-sm">Hapus</button> : <div className="flex flex-wrap items-center gap-3 text-sm"><span>Hapus kegiatan dan fotonya?</span><button disabled={busy} onClick={remove} className="text-red-300">{busy ? 'Menghapus…' : 'Ya, hapus'}</button><button disabled={busy} onClick={() => setConfirm(false)}>Batal</button></div>}
    {error && <p role="alert" className="editor-error">{error}</p>}
  </div>;
}
