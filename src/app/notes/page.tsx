import React from "react";
import Link from "next/link";
import db from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const [rows]: any = await db.query('SELECT * FROM notes ORDER BY id DESC');

  return (
    <div className="min-h-screen pt-12 pb-24 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 w-full">
      <div className="mb-12" data-aos="fade-up">
        <h1 className="text-4xl font-extrabold text-white mb-4">Daily <span className="text-salmon-500">Notes</span></h1>
        <p className="text-lg text-gray-400">
          A collection of my thoughts, learnings, and daily reflections on software development.
        </p>
      </div>

      <div className="space-y-6">
        {rows.map((note: any, index: number) => {
          const tags = Array.isArray(note.tags) ? note.tags : (typeof note.tags === 'string' ? JSON.parse(note.tags) : []);
          return (
            <article key={note.id} data-aos="fade-up" data-aos-delay={index * 100} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 md:p-8 hover:border-salmon-500/30 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <Link href={`/notes/${note.id}`}>
                  <h2 className="text-2xl font-bold text-white hover:text-salmon-400 transition-colors">
                    {note.title}
                  </h2>
                </Link>
                <time className="text-sm text-salmon-500 bg-salmon-500/10 px-3 py-1 rounded-full font-medium whitespace-nowrap">
                  {note.date}
                </time>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {tags.map((tag: string) => (
                  <span key={tag} className="text-xs px-2 py-1 bg-zinc-800 text-gray-400 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="prose prose-invert max-w-none text-gray-300 text-sm md:text-base leading-relaxed mb-6">
                <p className="line-clamp-3">{note.content}</p>
              </div>

              <Link href={`/notes/${note.id}`} className="inline-flex items-center text-sm font-semibold text-salmon-500 hover:text-salmon-400">
                Read More &rarr;
              </Link>
            </article>
          );
        })}
        {rows.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No notes published yet.
          </div>
        )}
      </div>
    </div>
  );
}
