"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import Link from "next/link";
import { createNote } from "@/app/actions/admin";
import Swal from "sweetalert2";

export default function CreateNotePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      const result = await createNote(formData);
      if (result.success) {
        await Swal.fire({
          title: "Berhasil!",
          text: "Note baru berhasil ditambahkan.",
          icon: "success",
          confirmButtonColor: "#f97066",
          background: "#18181b",
          color: "#fff",
        });
        router.push("/admin/notes");
      } else {
        await Swal.fire({
          title: "Gagal!",
          text: result.message || "Terjadi kesalahan saat membuat note.",
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
        <Link href="/admin/notes" className="text-sm text-salmon-500 hover:text-salmon-400 mb-4 inline-block">
          &larr; Back to Notes
        </Link>
        <h1 className="text-3xl font-bold text-white">Add New <span className="text-salmon-500">Note</span></h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-300">Note Title</label>
            <input name="title" required type="text" id="title" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" placeholder="e.g. My Next.js Journey" />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium text-gray-300">Content</label>
            <textarea name="content" required id="content" rows={8} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" placeholder="Write your thoughts..." />
          </div>

          <div className="space-y-2">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-300">Tags (comma separated)</label>
            <input name="tags" required type="text" id="tags" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" placeholder="Design, Programming" />
          </div>

          <div className="pt-4 flex items-center justify-end gap-4">
            <Link href="/admin/notes">
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Note"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
