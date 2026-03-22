"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import Link from "next/link";
import { createProject } from "@/app/actions/admin";
import Swal from "sweetalert2";

export default function CreateProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      const result = await createProject(formData);
      if (result.success) {
        await Swal.fire({
          title: "Berhasil!",
          text: "Project baru berhasil ditambahkan.",
          icon: "success",
          confirmButtonColor: "#f97066",
          background: "#18181b",
          color: "#fff",
        });
        router.push("/admin/projects");
      } else {
        await Swal.fire({
          title: "Gagal!",
          text: result.message || "Terjadi kesalahan saat membuat project.",
          icon: "error",
          confirmButtonColor: "#f97066",
          background: "#18181b",
          color: "#fff",
        });
      }
    } catch {
      await Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan yang tidak terduga.",
        icon: "error",
        confirmButtonColor: "#f97066",
        background: "#18181b",
        color: "#fff",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-12 pb-24 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 w-full">
      <div className="mb-8">
        <Link href="/admin/projects" className="text-sm text-salmon-500 hover:text-salmon-400 mb-4 inline-block">
          &larr; Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-white">Add New <span className="text-salmon-500">Project</span></h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-300">Project Title</label>
            <input name="title" required type="text" id="title" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" placeholder="e.g. My Awesome App" />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
            <textarea name="description" required id="description" rows={4} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" placeholder="Describe the project..." />
          </div>

          <div className="space-y-2">
            <label htmlFor="demoUrl" className="block text-sm font-medium text-gray-300">Demo / Deployed URL</label>
            <input name="demoUrl" type="url" id="demoUrl" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" placeholder="https://my-app.vercel.app" />
          </div>

          <div className="space-y-2">
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300">Image Cover URL</label>
            <input name="imageUrl" type="url" id="imageUrl" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" placeholder="https://..." />
          </div>

          <div className="space-y-2">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-300">Tags (comma separated)</label>
            <input name="tags" required type="text" id="tags" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" placeholder="React, Next.js, Tailwind" />
          </div>

          <div className="pt-4 flex items-center justify-end gap-4">
            <Link href="/admin/projects">
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Project"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
