"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import Link from "next/link";
import { createExperience } from "@/app/actions/admin";
import Swal from "sweetalert2";

export default function CreateExperiencePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      const result = await createExperience(formData);
      if (result.success) {
        await Swal.fire({
          title: "Berhasil!",
          text: "Experience baru berhasil ditambahkan.",
          icon: "success",
          confirmButtonColor: "#f97066",
          background: "#18181b",
          color: "#fff",
        });
        router.push("/admin/experience");
      } else {
        await Swal.fire({
          title: "Gagal!",
          text: result.message || "Terjadi kesalahan saat membuat experience.",
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
        <Link href="/admin/experience" className="text-sm text-salmon-500 hover:text-salmon-400 mb-4 inline-block">
          &larr; Back to Experience
        </Link>
        <h1 className="text-3xl font-bold text-white">Add New <span className="text-salmon-500">Experience</span></h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-medium text-gray-300">Role / Job Title</label>
            <input name="role" required type="text" id="role" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" placeholder="e.g. Frontend Engineer" />
          </div>

          <div className="space-y-2">
            <label htmlFor="company" className="block text-sm font-medium text-gray-300">Company</label>
            <input name="company" required type="text" id="company" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" placeholder="e.g. Tech Corp" />
          </div>

          <div className="space-y-2">
            <label htmlFor="duration" className="block text-sm font-medium text-gray-300">Duration</label>
            <input name="duration" required type="text" id="duration" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" placeholder="e.g. 2023 - Present" />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
            <textarea name="description" required id="description" rows={4} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" placeholder="Describe your responsibilities..." />
          </div>

          <div className="pt-4 flex items-center justify-end gap-4">
            <Link href="/admin/experience">
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add Experience"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
