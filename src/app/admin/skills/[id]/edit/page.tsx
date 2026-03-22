import React from "react";
import db from "@/lib/db";
import { Button } from "@/components/Button";
import { EditFormWrapper } from "@/components/EditFormWrapper";
import Link from "next/link";
import { updateSkill } from "@/app/actions/admin";
import { redirect } from "next/navigation";

export default async function EditSkillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [rows]: any = await db.query('SELECT * FROM skills WHERE id = ?', [id]);
  
  if (rows.length === 0) {
    redirect('/admin/skills');
  }

  const skill = rows[0];
  const updateAction = updateSkill.bind(null, skill.id.toString());

  return (
    <div className="min-h-screen pt-12 pb-24 mx-auto max-w-xl px-4 sm:px-6 lg:px-8 w-full">
      <div className="mb-8">
        <Link href="/admin/skills" className="text-sm text-salmon-500 hover:text-salmon-400 mb-4 inline-block">
          &larr; Back to Skills
        </Link>
        <h1 className="text-3xl font-bold text-white">Edit <span className="text-salmon-500">Skill</span></h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8">
        <EditFormWrapper action={updateAction} redirectTo="/admin/skills" successMessage="Skill berhasil diperbarui!" className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Skill Name</label>
            <input name="name" defaultValue={skill.name} required type="text" id="name" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" />
          </div>

          <div className="space-y-2">
            <label htmlFor="level" className="block text-sm font-medium text-gray-300">Proficiency Level (1-100)</label>
            <input name="level" defaultValue={skill.level} required type="number" min="1" max="100" id="level" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300 mb-2">Skill Type</label>
            <div className="flex items-center gap-6">
               <label className="flex items-center gap-2 text-white">
                 <input type="radio" name="type" defaultChecked={skill.type === 'hard'} value="hard" className="accent-salmon-500 w-4 h-4" />
                 Hard Skill
               </label>
               <label className="flex items-center gap-2 text-white">
                 <input type="radio" name="type" defaultChecked={skill.type === 'soft'} value="soft" className="accent-salmon-500 w-4 h-4" />
                 Soft Skill
               </label>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-4">
            <Link href="/admin/skills">
              <Button type="button" variant="secondary">Cancel</Button>
            </Link>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </EditFormWrapper>
      </div>
    </div>
  );
}
