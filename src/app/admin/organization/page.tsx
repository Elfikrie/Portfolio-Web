import React from "react";
import Link from "next/link";
import db from "@/lib/db";
import { Button } from "@/components/Button";
import { DeleteButton } from "@/components/DeleteButton";
import { deleteOrganization } from "@/app/actions/admin";

export const dynamic = "force-dynamic";

export default async function AdminOrganizationPage() {
  const [rows]: any = await db.query('SELECT * FROM organizations ORDER BY id DESC');

  return (
    <div className="min-h-screen pt-12 pb-24 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 w-full">
      <div className="mb-8">
        <Link href="/admin" className="text-sm text-salmon-500 hover:text-salmon-400 mb-4 inline-block">
          &larr; Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Manage <span className="text-salmon-500">Organizations</span></h1>
            <p className="text-gray-400 mt-1">Admin dashboard to manage your organizational experiences.</p>
          </div>
          <Link href="/admin/organization/create">
            <Button>+ Add New Organization</Button>
          </Link>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-400">
            <thead className="bg-zinc-800/50 text-gray-300 uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Organization Name</th>
                <th className="px-6 py-4 font-medium">Duration</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {rows.map((org: any) => {
                const boundDelete = deleteOrganization.bind(null, org.id.toString());
                return (
                  <tr key={org.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white">{org.role}</div>
                    </td>
                    <td className="px-6 py-4">{org.name}</td>
                    <td className="px-6 py-4">{org.duration}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3 items-center">
                        <Link href={`/admin/organization/${org.id}/edit`}>
                          <button className="text-blue-400 hover:text-blue-300 font-medium">Edit</button>
                        </Link>
                        <DeleteButton deleteAction={boundDelete} itemName="Organization" />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No organizational entries found.
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
