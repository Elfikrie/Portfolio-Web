import React from "react";
import Link from "next/link";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import CommentSection from "@/components/CommentSection";

export const dynamic = "force-dynamic";

export default async function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [rows]: any = await db.query('SELECT * FROM notes WHERE id = ?', [id]);

  if (rows.length === 0) {
    redirect('/notes');
  }

  const note = rows[0];
  const tags = Array.isArray(note.tags) ? note.tags : (typeof note.tags === 'string' ? JSON.parse(note.tags) : []);

  return (
    <article className="min-h-screen pt-12 pb-24 mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 w-full">
      <Link href="/notes" className="text-sm text-salmon-500 hover:text-salmon-400 mb-8 inline-block">
        &larr; Back to Notes
      </Link>

      <header className="mb-10" data-aos="fade-up">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <time className="text-sm text-salmon-500 font-mono tracking-tight">{note.date}</time>
          {tags.map((tag: string) => (
            <span key={tag} className="text-xs px-2 py-1 bg-zinc-800 text-gray-400 rounded-md">
              #{tag}
            </span>
          ))}
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">{note.title}</h1>
      </header>

      <div data-aos="fade-up" data-aos-delay="100" className="prose prose-invert prose-salmon max-w-none text-gray-300 text-lg leading-relaxed mb-16">
        <p>{note.content}</p>
      </div>

      <hr className="border-zinc-800 mb-12" />

      <div data-aos="fade-up" data-aos-delay="200">
        <CommentSection noteId={id} />
      </div>
    </article>
  );
}
