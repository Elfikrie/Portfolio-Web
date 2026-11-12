"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { HeaderUser } from "@/lib/profile";

const links = [
  { name: "Home", path: "/" }, { name: "Skills", path: "/skills" },
  { name: "Experience", path: "/experience" }, { name: "Projects", path: "/projects" },
  { name: "Aktivitas", path: "/activities" }, { name: "Notes", path: "/notes" },
  { name: "Contact", path: "/contact" },
];

export default function Navbar({ initialUser }: { initialUser: HeaderUser }) {
  const pathname = usePathname();
  const [user, setUser] = useState(initialUser);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    let active = true;
    async function refreshSession() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store", credentials: "same-origin" });
        if (response.ok && active) setUser((await response.json()).user);
      } catch { /* Keep the server-verified identity during transient network errors. */ }
    }
    void refreshSession();
    const focus = () => { void refreshSession(); };
    window.addEventListener("focus", focus);
    return () => { active = false; window.removeEventListener("focus", focus); };
  }, [pathname]);

  const account = (
    <Link href={user ? "/admin" : "/login"} prefetch={false} onClick={() => setOpen(false)}
      aria-label={user ? `Dashboard ${user.name}` : "Login admin"}
      className={user ? "site-account" : "site-account site-account-guest"}>
      {user && <Image src={user.avatar} width={30} height={30} alt="" className="rounded-full object-cover" />}
      <span>{user ? user.name : "Admin"}</span>
      <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 17 17 7M7 7h10v10" /></svg>
    </Link>
  );
  return (
    <header className="site-header">
      <nav aria-label="Navigasi utama" className="site-nav">
        <Link href="/" onClick={() => setOpen(false)} className="site-logo">Portfolio<span>El.</span></Link>
        <div className="hidden lg:flex items-center gap-6">
          {links.map(link => <Link key={link.path} href={link.path} className="site-nav-link"
            aria-current={pathname === link.path ? "page" : undefined}>{link.name}</Link>)}
        </div>
        <div className="flex items-center gap-4">
          {account}
          <button type="button" className="site-menu-toggle lg:hidden" aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)}>
            <span className={open ? "rotate-45 translate-y-[3px]" : ""} />
            <span className={open ? "-rotate-45 -translate-y-[3px]" : ""} />
          </button>
        </div>
      </nav>
      {open && <div id="mobile-navigation" className="site-mobile-nav lg:hidden">
        {links.map((link, index) => <Link key={link.path} href={link.path} onClick={() => setOpen(false)}
          aria-current={pathname === link.path ? "page" : undefined}><span className="text-xs text-zinc-500 font-mono">0{index + 1}</span>{link.name}<span aria-hidden="true" className="ml-auto">↗</span></Link>)}
      </div>}
    </header>
  );
}
