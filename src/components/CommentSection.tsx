"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import Swal from "sweetalert2";

interface Comment {
  id: number;
  note_id: number;
  author: string;
  content: string;
  created_at: string;
}

export default function CommentSection({ noteId }: { noteId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentName, setCommentName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load comments from database
  useEffect(() => {
    fetch(`/api/comments?noteId=${noteId}`)
      .then(res => res.json())
      .then(data => {
        setComments(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [noteId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) return;

    setIsSubmitting(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noteId: noteId,
          author: commentName,
          content: commentText,
        }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments(prev => [...prev, newComment]);
        setCommentName("");
        setCommentText("");
        await Swal.fire({
          title: "Berhasil!",
          text: "Komentar berhasil dikirim.",
          icon: "success",
          confirmButtonColor: "#f97066",
          background: "#18181b",
          color: "#fff",
          timer: 1500,
          showConfirmButton: false,
        });
      } else {
        await Swal.fire({
          title: "Gagal!",
          text: "Gagal mengirim komentar.",
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <section>
      <h3 className="text-2xl font-bold text-white mb-8">
        Comments ({isLoading ? "..." : comments.length})
      </h3>

      <div className="space-y-6 mb-12">
        {isLoading ? (
          <p className="text-gray-500 text-sm">Loading comments...</p>
        ) : (
          <>
            {comments.map(comment => (
              <div key={comment.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white">{comment.author}</h4>
                  <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
                </div>
                <p className="text-gray-300 text-sm">{comment.content}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-gray-500 text-sm italic">No comments yet. Be the first to share your thoughts!</p>
            )}
          </>
        )}
      </div>

      {/* Comment Form */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 sm:p-8">
        <h4 className="text-lg font-bold text-white mb-4">Leave a Reply</h4>
        <form onSubmit={handlePostComment} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-400 mb-1">Name</label>
            <input required type="text" id="name" value={commentName} onChange={e => setCommentName(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-salmon-500" placeholder="Your name" />
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-400 mb-1">Comment</label>
            <textarea required id="comment" rows={3} value={commentText} onChange={e => setCommentText(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-salmon-500" placeholder="What are your thoughts?" />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Posting..." : "Post Comment"}
          </Button>
        </form>
      </div>
    </section>
  );
}
