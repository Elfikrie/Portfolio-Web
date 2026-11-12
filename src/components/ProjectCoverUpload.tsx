"use client";

import { useEffect, useRef, useState } from 'react';

export default function ProjectCoverUpload({ currentUrl }: { currentUrl?: string | null }) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function clearSelection() {
    if (input.current) { input.current.value = ''; input.current.setCustomValidity(''); }
    setPreview(''); setError('');
  }

  return <div className="space-y-3">
    <label htmlFor="coverPhoto" className="block text-sm font-medium text-gray-300">Foto cover</label>
    <div className="aspect-video overflow-hidden rounded-lg border border-zinc-700 bg-zinc-800 flex items-center justify-center">
      {(preview || currentUrl) ? (
        // Uploaded covers are optimized on the server; previews also support local blob URLs.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview || currentUrl!} alt="Pratinjau cover project" className="w-full h-full object-cover" />
      ) : <div className="text-center px-5"><span aria-hidden="true" className="block text-3xl text-salmon-500 mb-2">＋</span><p className="text-sm text-gray-400">Pilih foto untuk cover project Anda.</p></div>}
    </div>
    <input ref={input} id="coverPhoto" name="coverPhoto" type="file" accept="image/jpeg,image/png,image/webp"
      aria-describedby="cover-help" className="block w-full min-w-0 text-sm text-gray-400 file:mr-3 file:rounded-md file:border file:border-zinc-600 file:bg-zinc-800 file:px-4 file:py-2 file:text-gray-200 focus-visible:outline-2 focus-visible:outline-salmon-500"
      onChange={event => {
        const file = event.target.files?.[0];
        if (!file) { clearSelection(); return; }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || !file.size || file.size > 3 * 1024 * 1024) {
          clearSelection();
          const message = 'Pilih JPG, PNG, atau WebP maksimal 3 MB.';
          input.current?.setCustomValidity(message); setError(message); return;
        }
        input.current?.setCustomValidity(''); setError(''); setPreview(URL.createObjectURL(file));
      }} />
    <p id="cover-help" className="text-xs text-gray-400 leading-relaxed">JPG, PNG, atau WebP · maksimal 3 MB. Foto dioptimalkan otomatis.
      {currentUrl && <span className="block">Cover saat ini tetap digunakan jika Anda tidak memilih foto baru.</span>}
    </p>
    {(preview || error) && <button type="button" onClick={clearSelection} className="text-xs text-salmon-400 hover:underline">{currentUrl ? 'Batalkan penggantian foto' : 'Batalkan pilihan foto'}</button>}
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
  </div>;
}
