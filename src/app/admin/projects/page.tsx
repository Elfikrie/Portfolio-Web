import React from "react";
import Link from "next/link";
import db from "@/lib/db";
import { Button } from "@/components/Button";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteProject } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminProjectsPage() {
  const [rows]: any = await db.query('SELECT * FROM projects ORDER BY created_at DESC');

  return (
    <div className="min-h-screen pt-12 pb-24 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Manage <span className="text-salmon-500">Projects</span></h1>
          <p className="text-gray-400 mt-1">Admin dashboard to manage portfolio projects.</p>
        </div>
        <Link href="/admin/projects/create">
          <Button>+ Add New Project</Button>
        </Link>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-zinc-800/50 text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Project Name</th>
                <th className="px-6 py-4 font-medium">Demo URL</th>
                <th className="px-6 py-4 font-medium">Tags</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {rows.map((project: any) => {
                const tags = Array.isArray(project.tags) ? project.tags : (typeof project.tags === 'string' ? JSON.parse(project.tags) : []);
                const boundDelete = deleteProject.bind(null, project.id.toString());
                
                return (
                  <tr key={project.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{project.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      {project.demoUrl || project.demourl ? (
                        <a href={project.demoUrl || project.demourl} target="_blank" rel="noopener noreferrer" className="text-salmon-500 hover:underline">
                          {project.demoUrl || project.demourl}
                        </a>
                      ) : <span className="text-zinc-600">N/A</span>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {tags.slice(0, 2).map((tag: string) => (
                          <span key={tag} className="text-xs bg-zinc-800 px-2 py-0.5 rounded">{tag}</span>
                        ))}
                        {tags.length > 2 && <span className="text-xs text-gray-500">+{tags.length - 2}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 items-center">
                        <Link href={`/admin/projects/${project.id}/edit`}>
                          <button className="text-blue-400 hover:text-blue-300 font-medium">Edit</button>
                        </Link>
                        <DeleteButton deleteAction={boundDelete} itemName="Project" />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
