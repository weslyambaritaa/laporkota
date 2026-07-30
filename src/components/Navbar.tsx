"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import { ThemeToggle } from "./ThemeToggle";
import { NotificationBell } from "./NotificationBell";

export function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (active) {
          setProfile(null);
          setLoading(false);
        }
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (active) {
        setProfile(data);
        setLoading(false);
      }
    }

    loadProfile();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const links = [
    { href: "/", label: "Beranda" },
    { href: "/peta", label: "Peta" },
    ...(profile ? [{ href: "/laporan/saya", label: "Laporan Saya" }] : []),
    ...(profile?.role === "admin"
      ? [{ href: "/admin", label: "Dashboard Admin" }]
      : []),
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-[44px] max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex items-center gap-2 text-[15px] font-semibold">
          <span className="flex h-7 w-7 items-center justify-center rounded-[5px] bg-primary text-sm font-bold text-white">
            L
          </span>
          <span>LaporKota</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`border-b-2 px-2 py-2 text-[13px] font-normal transition ${
                pathname === link.href
                  ? "border-primary text-primary"
                  : "border-transparent text-foreground/80 hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {profile && <NotificationBell userId={profile.id} />}
          <ThemeToggle />
          {!loading &&
            (profile ? (
              <>
                <Link
                  href="/laporan/baru"
                  className="hidden rounded-[5px] bg-primary px-4 py-2 text-sm font-normal text-white transition hover:bg-primary-hover active:bg-primary-active sm:block"
                >
                  + Lapor
                </Link>
                <button
                  onClick={handleLogout}
                  className="rounded-[5px] border border-border px-4 py-2 text-sm font-normal transition hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Keluar
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-[5px] px-4 py-2 text-sm font-normal hover:bg-black/5 dark:hover:bg-white/10"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="rounded-[5px] bg-primary px-4 py-2 text-sm font-normal text-white transition hover:bg-primary-hover active:bg-primary-active"
                >
                  Daftar
                </Link>
              </>
            ))}
        </div>
      </nav>
      <div className="flex items-center gap-1 overflow-x-auto border-t border-border px-4 py-1 md:hidden">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 rounded-[5px] px-3 py-1.5 text-sm font-medium ${
              pathname === link.href ? "text-primary" : ""
            }`}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
