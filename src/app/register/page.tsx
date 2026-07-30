"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok.");
      return;
    }
    if (password.length < 6) {
      toast.error("Kata sandi minimal 6 karakter.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });
    setLoading(false);

    if (error) {
      // Supabase can't always hide "this email is already registered" (it
      // only obfuscates the *unconfirmed* case automatically). We
      // normalize that specific message here so the form can't be used to
      // enumerate which emails already have a confirmed account.
      const isEnumerationLeak = /already registered|already exists/i.test(error.message);
      toast.error(
        isEnumerationLeak
          ? "Jika email tersebut valid, silakan masuk atau gunakan 'Lupa Kata Sandi'."
          : error.message,
      );
      return;
    }

    if (data.session) {
      toast.success("Akun berhasil dibuat!");
      router.push("/");
      router.refresh();
    } else {
      toast.success("Akun dibuat. Silakan cek email untuk konfirmasi sebelum masuk.");
      router.push("/login");
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10">
      <h1 className="text-2xl font-bold">Daftar Akun LaporKota</h1>
      <p className="mt-1 text-sm text-muted">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-primary">
          Masuk di sini
        </Link>
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Nama Lengkap
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-lg border border-border bg-transparent px-3 py-2 outline-none focus:border-primary"
            placeholder="Nama Anda"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-border bg-transparent px-3 py-2 outline-none focus:border-primary"
            placeholder="nama@email.com"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Kata Sandi
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-border bg-transparent px-3 py-2 outline-none focus:border-primary"
            placeholder="Minimal 6 karakter"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Konfirmasi Kata Sandi
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="rounded-lg border border-border bg-transparent px-3 py-2 outline-none focus:border-primary"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-lg bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
        >
          {loading ? "Memproses..." : "Daftar"}
        </button>

        <p className="text-center text-xs text-muted">
          Akun baru otomatis berperan sebagai Warga. Untuk akun Admin, hubungi
          pengelola untuk diubah manual melalui dashboard Supabase.
        </p>
      </form>
    </div>
  );
}
