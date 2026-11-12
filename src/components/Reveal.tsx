"use client";

import { useEffect, useRef } from 'react';

export default function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const element = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = element.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
    // Content is visible without JS. Only animate items arriving below the fold.
    if (node.getBoundingClientRect().top < window.innerHeight) return;
    node.dataset.reveal = 'waiting';
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { node.dataset.reveal = 'visible'; observer.disconnect(); }
    }, { threshold: 0.08 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div ref={element} className={`journal-reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}
