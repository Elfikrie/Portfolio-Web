"use client";
import { useEffect, useRef, useState } from 'react';

export default function SkillImageUpload({ imageKey }: { imageKey?: string | null }) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState('');
  const [error, setError] = useState('');
  const [remove, setRemove] = useState(false);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  function clear() {
    if (input.current) { input.current.value = ''; input.current.setCustomValidity(''); }
    setPreview(''); setError('');
  }
  const src = preview || (!remove && imageKey ? `/api/skill-images/${imageKey}` : '');
  return <div className="space-y-3">
    <label htmlFor="skillImage" className="block text-sm font-medium text-gray-300">Foto / logo skill <span className="text-gray-500 font-normal">(opsional)</span></label>
    <div className="w-36 h-36 rounded-xl border border-zinc-700 bg-zinc-800 flex items-center justify-center p-4">
      {src ? (
        // Local preview and server-optimized logos are displayed without cropping.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="Pratinjau foto atau logo skill" className="w-full h-full object-contain" />
      ) : <div className="text-center"><span aria-hidden="true" className="block text-3xl text-salmon-400 mb-2">＋</span><span className="text-xs text-gray-400">Identitas visual<br />skill Anda</span></div>}
    </div>
    <input ref={input} type="file" name="skillImage" id="skillImage" accept="image/jpeg,image/png,image/webp" aria-describedby="skill-image-help"
      className="block w-full min-w-0 text-sm text-gray-400 file:mr-3 file:rounded-md file:border file:border-zinc-600 file:bg-zinc-800 file:px-4 file:py-2 file:text-gray-200 focus-visible:outline-2 focus-visible:outline-salmon-500"
      onChange={event => {
        const file = event.target.files?.[0];
        if (!file) { clear(); return; }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || !file.size || file.size > 3 * 1024 * 1024) {
          clear(); const message = 'Pilih JPG, PNG, atau WebP maksimal 3 MB.';
          input.current?.setCustomValidity(message); setError(message); return;
        }
        input.current?.setCustomValidity(''); setError(''); setRemove(false); setPreview(URL.createObjectURL(file));
      }} />
    <p id="skill-image-help" className="text-xs text-gray-400 leading-relaxed">JPG, PNG, atau WebP · maks. 3 MB. Logo ditampilkan utuh; transparansi PNG/WebP tetap terjaga.</p>
    {(preview || error) && <button type="button" onClick={clear} className="text-xs text-salmon-400 hover:underline">Batalkan pilihan foto</button>}
    {imageKey && <label className="flex items-center gap-2 text-sm text-gray-400"><input name="removeImage" type="checkbox" checked={remove} onChange={event => { clear(); setRemove(event.target.checked); }} className="accent-salmon-500" />Hapus logo saat disimpan</label>}
    {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
  </div>;
}
