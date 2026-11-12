"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/Button";

const inputClass = "w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-white outline-none transition focus:border-salmon-500 focus:ring-2 focus:ring-salmon-500/20 disabled:opacity-60";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "password">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const busy = useRef(false);
  const passwordInput = useRef<HTMLInputElement>(null);
  const changing = mode === "password";

  function switchMode(next: "login" | "password") {
    setMode(next);
    setPassword("");
    setNewPassword("");
    setConfirmation("");
    setShowPassword(false);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    setError("");
    setSuccess("");
    if (changing && newPassword !== confirmation) {
      setError("Konfirmasi password belum sama.");
      return;
    }
    if (changing && (newPassword.length < 12 || new TextEncoder().encode(newPassword).length > 72)) {
      setError("Password baru minimal 12 karakter dan maksimal 72 byte.");
      return;
    }
    busy.current = true;
    setIsLoading(true);
    try {
      const response = await fetch(changing ? "/api/auth/change-password" : "/api/auth/login", {
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changing
          ? { username: username.trim(), currentPassword: password, newPassword, confirmPassword: confirmation }
          : { username: username.trim(), password }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.message || "Permintaan gagal. Silakan coba lagi.");
      } else if (changing) {
        switchMode("login");
        setSuccess("Password berhasil diubah. Silakan masuk dengan password baru.");
        passwordInput.current?.focus();
      } else {
        setSuccess("Login berhasil. Membuka dashboard…");
        // Start a fresh request with the new cookie, avoiding prefetched anonymous routes.
        window.location.replace("/admin");
        return;
      }
    } catch {
      setError("Tidak dapat terhubung. Periksa koneksi lalu coba lagi.");
    }
    busy.current = false;
    setIsLoading(false);
  }

  return (
    <div className="flex min-h-[calc(100svh-8rem)] items-center justify-center px-4 py-12 sm:py-16">
      <section aria-labelledby="auth-heading" className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-salmon-500/10 blur-3xl" />
        <div className="relative">
          <div className="mb-7">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-salmon-400">PortfolioEl / Admin</p>
            <h1 id="auth-heading" className="text-3xl font-bold tracking-tight text-white">{changing ? "Ubah password" : "Selamat datang."}</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{changing ? "Verifikasi akun dengan password lama, lalu buat password baru." : "Masuk untuk mengelola konten portfolio Anda."}</p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-zinc-950/70 p-1" aria-label="Pilihan akun">
            {(["login", "password"] as const).map((item) => (
              <button key={item} type="button" aria-pressed={mode === item} disabled={isLoading} onClick={() => switchMode(item)}
                className={`rounded-lg px-3 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-salmon-500 disabled:opacity-60 ${mode === item ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-400 hover:text-white"}`}>
                {item === "login" ? "Masuk" : "Ubah password"}
              </button>
            ))}
          </div>

          {error && <p role="alert" className="mb-5 rounded-xl border border-red-400/20 bg-red-400/10 p-3 text-sm leading-6 text-red-200">{error}</p>}
          {success && <p role="status" className="mb-5 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 text-sm leading-6 text-emerald-200">{success}</p>}

          <form onSubmit={handleSubmit} aria-busy={isLoading} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-medium text-zinc-300">Username</label>
              <input id="username" name="username" required autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={255}
                disabled={isLoading} value={username} onChange={(e) => setUsername(e.target.value)} className={inputClass} placeholder="Username admin" />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300">{changing ? "Password lama" : "Password"}</label>
              <input ref={passwordInput} id="password" name="password" required type={showPassword ? "text" : "password"} autoComplete="current-password"
                disabled={isLoading} value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
            </div>
            {changing && <>
              <div className="space-y-2">
                <label htmlFor="new-password" className="block text-sm font-medium text-zinc-300">Password baru</label>
                <input id="new-password" name="newPassword" required type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={12} maxLength={72}
                  aria-describedby="password-help" disabled={isLoading} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />
                <p id="password-help" className="text-xs leading-5 text-zinc-400">Minimal 12 karakter. Gunakan password yang unik.</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="confirm-password" className="block text-sm font-medium text-zinc-300">Konfirmasi password baru</label>
                <input id="confirm-password" name="confirmPassword" required type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={12} maxLength={72}
                  disabled={isLoading} value={confirmation} onChange={(e) => setConfirmation(e.target.value)} className={inputClass} />
              </div>
            </>}
            <label className="flex w-fit items-center gap-2 py-1 text-sm text-zinc-400">
              <input type="checkbox" checked={showPassword} disabled={isLoading} onChange={(e) => setShowPassword(e.target.checked)} className="h-4 w-4 accent-salmon-500" />
              Tampilkan password
            </label>
            <Button type="submit" size="lg" className="w-full gap-2 !rounded-xl" disabled={isLoading}>
              {isLoading ? "Memproses…" : changing ? "Simpan password baru" : "Masuk ke dashboard"}
              {!isLoading && <span aria-hidden="true">→</span>}
            </Button>
          </form>
          <p className="mt-6 text-center text-xs leading-5 text-zinc-500">{changing ? "Setelah password berubah, silakan masuk kembali." : "Akses khusus pengelola portfolio."}</p>
        </div>
      </section>
    </div>
  );
}
