"use client";

import React, { useTransition } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

interface EditFormWrapperProps {
  action: (formData: FormData) => Promise<{ success: boolean; message?: string }>;
  redirectTo: string;
  children: React.ReactNode;
  className?: string;
  successMessage?: string;
}

export function EditFormWrapper({ action, redirectTo, children, className, successMessage = "Berhasil disimpan!" }: EditFormWrapperProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const result = await action(formData);
        if (result.success) {
          await Swal.fire({
            title: "Berhasil!",
            text: successMessage,
            icon: "success",
            confirmButtonColor: "#f97066",
            background: "#18181b",
            color: "#fff",
          });
          router.push(redirectTo);
        } else {
          await Swal.fire({
            title: "Gagal!",
            text: result.message || "Terjadi kesalahan saat menyimpan.",
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
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {children}
    </form>
  );
}
