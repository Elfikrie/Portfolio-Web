import Link from "next/link";
import React from "react";

const Navbar = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-salmon-500/20 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-salmon-500 transition-colors">
          Portfo<span className="text-salmon-500">lio.</span>
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-foreground hover:text-salmon-400 transition-colors">Home</Link>
          <Link href="/projects" className="text-foreground hover:text-salmon-400 transition-colors">Projects</Link>
          <Link href="/notes" className="text-foreground hover:text-salmon-400 transition-colors">Notes</Link>
          <Link href="/admin/projects" className="px-3 py-1 text-xs font-semibold rounded-full bg-salmon-500/10 text-salmon-500 border border-salmon-500/20 hover:bg-salmon-500 hover:text-white transition-all">Admin</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
