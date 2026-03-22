"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/Button";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen pt-12 pb-24 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 w-full">
      <div className="mb-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Admin <span className="text-salmon-500">Dashboard</span></h1>
          <p className="text-gray-400 mt-2">Manage your portfolio content here.</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-colors">
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-salmon-500/50 transition-colors">
          <h2 className="text-xl font-bold text-white mb-2">Manage Projects</h2>
          <p className="text-sm text-gray-400 mb-6">Create, edit, and delete the projects displayed on your portfolio.</p>
          <Link href="/admin/projects">
            <Button className="w-full">Go to Projects</Button>
          </Link>
        </div>
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-salmon-500/50 transition-colors">
          <h2 className="text-xl font-bold text-white mb-2">Manage Notes</h2>
          <p className="text-sm text-gray-400 mb-6">Write new diary entries, edit existing notes, and manage insights.</p>
          <Link href="/admin/notes">
            <Button className="w-full">Go to Notes</Button>
          </Link>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-salmon-500/50 transition-colors">
          <h2 className="text-xl font-bold text-white mb-2">Manage Skills</h2>
          <p className="text-sm text-gray-400 mb-6">Add new hard/soft skills and adjust your proficiency levels.</p>
          <Link href="/admin/skills">
            <Button className="w-full">Go to Skills</Button>
          </Link>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-salmon-500/50 transition-colors">
          <h2 className="text-xl font-bold text-white mb-2">Manage Experience</h2>
          <p className="text-sm text-gray-400 mb-6">Update your professional work timeline.</p>
          <Link href="/admin/experience">
            <Button className="w-full">Go to Experience</Button>
          </Link>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 hover:border-salmon-500/50 transition-colors">
          <h2 className="text-xl font-bold text-white mb-2">Manage Organizations</h2>
          <p className="text-sm text-gray-400 mb-6">Update your organizational roles.</p>
          <Link href="/admin/organization">
            <Button className="w-full">Go to Organizations</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
