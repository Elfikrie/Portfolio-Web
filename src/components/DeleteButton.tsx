"use client";

import React, { useTransition } from "react";
import Swal from "sweetalert2";

interface DeleteButtonProps {
  deleteAction: () => Promise<{ success: boolean; message?: string }>;
  itemName?: string;
}

export function DeleteButton({ deleteAction, itemName = "item" }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = async () => {
    const confirm = await Swal.fire({
      title: "Apakah kamu yakin?",
      text: `${itemName} ini akan dihapus secara permanen!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#71717a",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
      background: "#18181b",
      color: "#fff",
    });

    if (confirm.isConfirmed) {
      startTransition(async () => {
        try {
          const result = await deleteAction();
          if (result.success) {
            await Swal.fire({
              title: "Berhasil!",
              text: `${itemName} berhasil dihapus.`,
              icon: "success",
              confirmButtonColor: "#f97066",
              background: "#18181b",
              color: "#fff",
            });
          } else {
            await Swal.fire({
              title: "Gagal!",
              text: result.message || "Terjadi kesalahan saat menghapus.",
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
        }
      });
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-400 hover:text-red-300 font-medium disabled:opacity-50"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
