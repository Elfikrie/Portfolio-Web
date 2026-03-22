"use client";

import Link from "next/link";
import React, { useState } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Skills", path: "/skills" },
  { name: "Experience", path: "/experience" },
  { name: "Projects", path: "/projects" },
  { name: "Notes", path: "/notes" },
  { name: "Contact", path: "/contact" },
];

const Navbar = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-salmon-500/20 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold tracking-tight text-white hover:text-salmon-500 transition-colors" onClick={closeMenu}>
          Portfolio<span className="text-salmon-500">El.</span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.path || (link.path !== '/' && pathname?.startsWith(link.path));
            return (
              <Link 
                key={link.path} 
                href={link.path} 
                className={`pb-1 transition-all duration-300 border-b-2 hover:text-salmon-400 ${
                  isActive 
                    ? "text-salmon-500 border-salmon-500" 
                    : "text-gray-300 border-transparent"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          
          <Link 
            href="/admin" 
            className={`px-3 py-1 text-xs font-semibold rounded-full border transition-all ${
              pathname?.startsWith('/admin') 
              ? "bg-salmon-500 text-white border-salmon-500" 
              : "bg-salmon-500/10 text-salmon-500 border-salmon-500/20 hover:bg-salmon-500 hover:text-white"
            }`}
          >
            Admin
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center">
          <button onClick={toggleMenu} className="text-gray-300 hover:text-salmon-500 focus:outline-none transition-colors">
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-zinc-900 border-b border-salmon-500/20 shadow-xl px-4 pt-4 pb-6 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
          {navLinks.map((link) => {
            const isActive = pathname === link.path || (link.path !== '/' && pathname?.startsWith(link.path));
            return (
              <Link 
                key={link.path} 
                href={link.path} 
                onClick={closeMenu}
                className={`py-2 text-base font-medium transition-colors border-l-4 pl-3 ${
                  isActive 
                    ? "text-salmon-500 border-salmon-500" 
                    : "text-gray-300 border-transparent hover:text-salmon-400 hover:border-salmon-500/50"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <Link 
            href="/admin" 
            onClick={closeMenu}
            className={`mt-2 py-2 px-4 rounded-lg text-center font-bold border transition-colors ${
              pathname?.startsWith('/admin') 
              ? "bg-salmon-500 text-white border-salmon-500" 
              : "bg-salmon-500/10 text-salmon-500 border-salmon-500/20"
            }`}
          >
            Admin Dashboard
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
