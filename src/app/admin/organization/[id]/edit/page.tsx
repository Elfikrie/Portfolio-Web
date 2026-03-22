import React from "react";
import db from "@/lib/db";
import { Button } from "@/components/Button";
import { EditFormWrapper } from "@/components/EditFormWrapper";
import Link from "next/link";
import { updateOrganization } from "@/app/actions/admin";
import { redirect } from "next/navigation";

export default async function EditOrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [rows]: any = await db.query('SELECT * FROM organizations WHERE id = ?', [id]);
  
  if (rows.length === 0) {
    redirect('/admin/organization');
  }

  const org = rows[0];
  const updateAction = updateOrganization.bind(null, org.id.toString());

  return (
    <div className="min-h-screen pt-12 pb-24 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 w-full">
      <div className="mb-8">
        <Link href="/admin/organization" className="text-sm text-salmon-500 hover:text-salmon-400 mb-4 inline-block">
          &larr; Back to Organizations
        </Link>
        <h1 className="text-3xl font-bold text-white">Edit <span className="text-salmon-500">Organization Entry</span></h1>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8">
        <EditFormWrapper action={updateAction} redirectTo="/admin/organization" successMessage="Organization berhasil diperbarui!" className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="role" className="block text-sm font-medium text-gray-300">Role / Position</label>
            <input name="role" defaultValue={org.role} required type="text" id="role" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" />
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Organization Name</label>
            <input name="name" defaultValue={org.name} required type="text" id="name" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" />
          </div>

          <div className="space-y-2">
            <label htmlFor="duration" className="block text-sm font-medium text-gray-300">Duration</label>
            <input name="duration" defaultValue={org.duration} required type="text" id="duration" className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
            <textarea name="description" defaultValue={org.description} required id="description" rows={4} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50" />
          </div>

          <div className="pt-4 flex items-center justify-end gap-4">
            <Link href="/admin/organization">
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
