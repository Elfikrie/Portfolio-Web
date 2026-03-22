"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import Link from "next/link";
import { createSkill } from "@/app/actions/admin";
import Swal from "sweetalert2";

export default function CreateSkillPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    try {
      const result = await createSkill(formData);
      if (result.success) {
        await Swal.fire({
          title: "Berhasil!",
          text: "Skill baru berhasil ditambahkan.",
          icon: "success",
          confirmButtonColor: "#f97066",
          background: "#18181b",
          color: "#fff",
        });
        router.push("/admin/skills");
      } else {
        await Swal.fire({
          title: "Gagal!",
          text: result.message || "Terjadi kesalahan saat membuat skill.",
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
    <div className="min-h-screen pt-12 pb-24 mx-auto max-w-xl px-4 sm:px-6 lg:px-8 w-full">
      <div className="mb-8">
        <Link href="/admin/skills" className="text-sm text-salmon-500 hover:text-salmon-400 mb-4 inline-block">
          &larr; Back to Skills
        </Link>
        <h1 className="text-3xl font-bold text-white">Add New <span className="text-salmon-500">Skill</span></h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8">
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Skill Name</label>
            <input name="name" required type="text" id="name" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" placeholder="e.g. Communication" />
          </div>

          <div className="space-y-2">
            <label htmlFor="level" className="block text-sm font-medium text-gray-300">Proficiency Level (1-100)</label>
            <input name="level" required type="number" min="1" max="100" id="level" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" placeholder="85" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Skill Type</label>
            <div className="flex items-center gap-6">
               <label className="flex items-center gap-2 text-white">
                 <input type="radio" name="type" required value="hard" className="accent-salmon-500 w-4 h-4" />
                 Hard Skill
               </label>
               <label className="flex items-center gap-2 text-white">
                 <input type="radio" name="type" required value="soft" className="accent-salmon-500 w-4 h-4" />
                 Soft Skill
               </label>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-4">
            <Link href="/admin/skills">
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Add Skill"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
