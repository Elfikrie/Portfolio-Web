export default function SkillImage({ name, imageKey, size = 'card' }: { name: string; imageKey?: string | null; size?: 'card' | 'small' }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(word => Array.from(word)[0] || '').join('').toUpperCase();
  return <span className={`inline-flex shrink-0 items-center justify-center rounded-xl border border-zinc-700/70 bg-zinc-800/70 ${size === 'small' ? 'h-9 w-9 p-1.5 text-xs' : 'h-14 w-14 p-2 text-lg'} text-salmon-400 font-semibold`}>
    {imageKey ? (
      // Logos are resized and optimized on upload; preserve the complete transparent artwork.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={`/api/skill-images/${imageKey}`} alt={`Logo ${name}`} width={size === 'small' ? 24 : 40} height={size === 'small' ? 24 : 40} loading="lazy" className="h-full w-full object-contain" />
    ) : <span aria-hidden="true">{initials}</span>}
  </span>;
}
