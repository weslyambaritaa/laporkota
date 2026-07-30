"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [validLink, setValidLink] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // The recovery link redirects here with a one-time token that
    // @supabase/ssr's browser client exchanges for a session
    // automatically on load, firing this event when it's ready to use.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setValidLink(true);
        setReady(true);
      }
    });

    // Fallback in case the event fired before this listener attached.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setValidLink(true);
      setReady(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password.length < 6) {
      toast.error("Kata sandi minimal 6 karakter.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    setSubmitting(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    await supabase.auth.signOut();
    toast.success("Kata sandi berhasil diperbarui. Silakan masuk kembali.");
    router.push("/login");
  }

  if (!ready) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center px-4 py-10 text-sm text-muted">
        Memeriksa tautan reset...
      </div>
    );
  }

  if (!validLink) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center gap-3 px-4 py-10 text-center">
        <h1 className="text-xl font-bold">Tautan Tidak Valid atau Kadaluarsa</h1>
        <p className="text-sm text-muted">
          Silakan minta tautan reset kata sandi baru.
        </p>
        <Link
          href="/lupa-sandi"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Minta Tautan Baru
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10">
      <h1 className="text-2xl font-bold">Buat Kata Sandi Baru</h1>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Kata Sandi Baru
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
          disabled={submitting}
          className="mt-2 rounded-lg bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
        >
          {submitting ? "Menyimpan..." : "Simpan Kata Sandi"}
        </button>
      </form>
    </div>
  );
}
