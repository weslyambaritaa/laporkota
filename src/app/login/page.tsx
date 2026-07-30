"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

// Client-side-only brute-force deterrent: this cannot replace real
// server-side protection (Supabase Auth already rate-limits its own
// endpoints), but it slows down a scripted attacker hammering the form and
// gives honest users clear feedback instead of silently retrying. Keyed by
// email + kept in sessionStorage so it survives a page refresh within the
// tab but resets per browser session.
const MAX_ATTEMPTS = 5;
const BASE_LOCKOUT_MS = 30_000;

type AttemptState = { count: number; lockedUntil: number };

function attemptKey(email: string) {
  return `login_attempts:${email.trim().toLowerCase()}`;
}

function readAttempts(email: string): AttemptState {
  if (typeof window === "undefined" || !email) return { count: 0, lockedUntil: 0 };
  try {
    const raw = window.sessionStorage.getItem(attemptKey(email));
    return raw ? JSON.parse(raw) : { count: 0, lockedUntil: 0 };
  } catch {
    return { count: 0, lockedUntil: 0 };
  }
}

function writeAttempts(email: string, state: AttemptState) {
  if (typeof window === "undefined" || !email) return;
  window.sessionStorage.setItem(attemptKey(email), JSON.stringify(state));
}

function clearAttempts(email: string) {
  if (typeof window === "undefined" || !email) return;
  window.sessionStorage.removeItem(attemptKey(email));
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (lockedUntil > Date.now() && !tickRef.current) {
      tickRef.current = setInterval(() => setNow(Date.now()), 1000);
    }
    if (lockedUntil <= Date.now() && tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    return () => {
      if (tickRef.current) clearInterval(tickRef.current);
    };
  }, [lockedUntil, now]);

  const isLocked = lockedUntil > now;
  const secondsLeft = Math.max(0, Math.ceil((lockedUntil - now) / 1000));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const attempts = readAttempts(email);
    if (attempts.lockedUntil > Date.now()) {
      setLockedUntil(attempts.lockedUntil);
      toast.error(`Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil((attempts.lockedUntil - Date.now()) / 1000)} detik.`);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      const nextCount = attempts.count + 1;
      if (nextCount >= MAX_ATTEMPTS) {
        // Exponential backoff, capped at 8 minutes.
        const lockoutMs = Math.min(
          BASE_LOCKOUT_MS * 2 ** (nextCount - MAX_ATTEMPTS),
          8 * 60_000,
        );
        const until = Date.now() + lockoutMs;
        writeAttempts(email, { count: nextCount, lockedUntil: until });
        setLockedUntil(until);
        toast.error(`Terlalu banyak percobaan gagal. Coba lagi dalam ${Math.ceil(lockoutMs / 1000)} detik.`);
      } else {
        writeAttempts(email, { count: nextCount, lockedUntil: 0 });
        toast.error(error.message);
      }
      return;
    }

    clearAttempts(email);
    toast.success("Berhasil masuk!");
    const next = searchParams.get("next") || "/";
    router.push(next);
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-md flex-col justify-center px-4 py-10">
      <h1 className="text-2xl font-bold">Masuk ke LaporKota</h1>
      <p className="mt-1 text-sm text-muted">
        Belum punya akun?{" "}
        <Link href="/register" className="font-medium text-primary">
          Daftar di sini
        </Link>
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

        <label className="flex flex-col gap-1 text-sm font-medium">
          Kata Sandi
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-[5px] border border-border bg-transparent px-3 py-2 outline-none focus:border-primary"
            placeholder="••••••••"
          />
        </label>

        <div className="flex justify-end">
          <Link href="/lupa-sandi" className="text-xs font-medium text-primary">
            Lupa kata sandi?
          </Link>
        </div>

        {isLocked && (
          <p className="rounded-[5px] bg-red-500/10 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400">
            Terlalu banyak percobaan gagal. Coba lagi dalam {secondsLeft} detik.
          </p>
        )}

        <button
          type="submit"
          disabled={loading || isLocked}
          className="mt-2 rounded-[5px] bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
        >
          {loading ? "Memproses..." : isLocked ? `Tunggu ${secondsLeft}s` : "Masuk"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
