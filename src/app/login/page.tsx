"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import Swal from "sweetalert2";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        await Swal.fire({
          title: "Login Berhasil!",
          text: "Selamat datang kembali, Admin.",
          icon: "success",
          confirmButtonColor: "#f97066",
          background: "#18181b",
          color: "#fff",
          timer: 1500,
          showConfirmButton: false,
        });
        router.push("/admin");
      } else {
        const data = await res.json();
        await Swal.fire({
          title: "Login Gagal!",
          text: data.message || "Username atau password salah.",
          icon: "error",
          confirmButtonColor: "#f97066",
          background: "#18181b",
          color: "#fff",
        });
      }
    } catch {
      await Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan. Coba lagi nanti.",
        icon: "error",
        confirmButtonColor: "#f97066",
        background: "#18181b",
        color: "#fff",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center -mt-16 px-4">
      <div data-aos="zoom-in" className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-salmon-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-salmon-500/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

        <div className="relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-white">Admin <span className="text-salmon-500">Login</span></h1>
            <p className="text-gray-400 mt-2 text-sm">Sign in to manage your portfolio content.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Username</label>
              <input
                required
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50 transition-all placeholder-zinc-500"
                placeholder="username"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <input
                required
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-zinc-800/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-salmon-500/50 transition-all placeholder-zinc-500"
                placeholder="••••••••"
              />
            </div>

            <div className="pt-4">
              <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? "Authenticating..." : "Login"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
