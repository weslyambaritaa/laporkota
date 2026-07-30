"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

const COOLDOWN_MS = 60_000;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const onCooldown = cooldownUntil > now;
  const secondsLeft = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (onCooldown) return;

    setLoading(true);
    const supabase = createClient();
    // Supabase's resetPasswordForEmail intentionally does not reveal
    // whether the address is registered — it always resolves the same way
    // and only actually sends an email if the account exists. We mirror
    // that here with one generic message regardless of outcome, so this
    // form can't be used to enumerate registered emails.
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-sandi`,
    });
    setLoading(false);
    setSent(true);
    setCooldownUntil(Date.now() + COOLDOWN_MS);
    toast.success("Jika email terdaftar, tautan reset kata sandi telah dikirim.");
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10">
      <h1 className="text-2xl font-bold">Lupa Kata Sandi</h1>
      <p className="mt-1 text-sm text-muted">
        Masukkan email akun Anda, kami akan mengirimkan tautan untuk membuat kata sandi baru.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-[5px] border border-border bg-transparent px-3 py-2 outline-none focus:border-primary"
            placeholder="nama@email.com"
          />
        </label>

        <button
          type="submit"
          disabled={loading || onCooldown}
          className="mt-2 rounded-[5px] bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
        >
          {loading
            ? "Mengirim..."
            : onCooldown
              ? `Kirim ulang dalam ${secondsLeft}s`
              : "Kirim Tautan Reset"}
        </button>

        {sent && (
          <p className="rounded-[5px] bg-green-500/10 px-3 py-2 text-xs text-green-700 dark:text-green-400">
            Jika email tersebut terdaftar, silakan cek kotak masuk (dan folder spam) untuk tautan reset kata sandi.
          </p>
        )}

        <Link href="/login" className="text-center text-xs font-medium text-primary">
          Kembali ke halaman masuk
        </Link>
      </form>
    </div>
  );
}
