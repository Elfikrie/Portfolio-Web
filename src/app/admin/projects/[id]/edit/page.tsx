import React from "react";
import db from "@/lib/db";
import { Button } from "@/components/Button";
import { EditFormWrapper } from "@/components/EditFormWrapper";
import Link from "next/link";
import { updateProject } from "@/app/actions/admin";
import { redirect } from "next/navigation";

export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [rows]: any = await db.query('SELECT * FROM projects WHERE id = ?', [id]);
  
  if (rows.length === 0) {
    redirect('/admin/projects');
  }

  const project = rows[0];
  const tags = Array.isArray(project.tags) ? project.tags : (typeof project.tags === 'string' ? JSON.parse(project.tags) : []);
  const updateAction = updateProject.bind(null, project.id.toString());

  return (
    <div className="min-h-screen pt-12 pb-24 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 w-full">
      <div className="mb-8">
        <Link href="/admin/projects" className="text-sm text-salmon-500 hover:text-salmon-400 mb-4 inline-block">
          &larr; Back to Projects
        </Link>
        <h1 className="text-3xl font-bold text-white">Edit <span className="text-salmon-500">Project</span></h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8">
        <EditFormWrapper action={updateAction} redirectTo="/admin/projects" successMessage="Project berhasil diperbarui!" className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium text-gray-300">Project Title</label>
            <input name="title" defaultValue={project.title} required type="text" id="title" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
            <textarea name="description" defaultValue={project.description} required id="description" rows={4} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" />
          </div>

          <div className="space-y-2">
            <label htmlFor="demoUrl" className="block text-sm font-medium text-gray-300">Demo / Deployed URL</label>
            <input name="demoUrl" defaultValue={project.demoUrl || project.demourl} type="url" id="demoUrl" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" />
          </div>

          <div className="space-y-2">
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-300">Image Cover URL</label>
            <input name="imageUrl" defaultValue={project.imageUrl || project.imageurl} type="url" id="imageUrl" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" />
          </div>

          <div className="space-y-2">
            <label htmlFor="tags" className="block text-sm font-medium text-gray-300">Tags (comma separated)</label>
            <input name="tags" defaultValue={tags.join(", ")} required type="text" id="tags" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" />
          </div>

          <div className="pt-4 flex items-center justify-end gap-4">
            <Link href="/admin/projects">
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
