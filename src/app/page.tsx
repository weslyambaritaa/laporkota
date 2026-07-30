import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ReportCard } from "@/components/ReportCard";
import type { Report } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: userData }, { data: recentRaw }, { count: total }, { count: selesai }] =
    await Promise.all([
      supabase.auth.getUser(),
      supabase
        .from("reports")
        .select("*, profiles!reports_user_id_fkey(full_name)")
        .order("created_at", { ascending: false })
        .limit(3),
      supabase.from("reports").select("*", { count: "exact", head: true }),
      supabase
        .from("reports")
        .select("*", { count: "exact", head: true })
        .eq("status", "selesai"),
    ]);

  const recent: Report[] = (recentRaw ?? []).map((r) => ({
    ...r,
    reporter_name: (r as { profiles?: { full_name: string } | null }).profiles
      ?.full_name,
  }));

  return (
    <div>
      <section className="mx-auto max-w-6xl px-4 py-16 text-center md:py-24">
        <h1 className="mx-auto mt-5 max-w-3xl text-4xl font-semibold md:text-5xl">
          Lapor Masalah Kota, <span className="text-primary">Tuntas Bersama</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-muted">
          LaporKota membantu warga melaporkan masalah infrastruktur & lingkungan
          sekitar secara cepat. AI membantu klasifikasi otomatis, peta transparansi
          menunjukkan progres penanganan secara real-time.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/laporan/baru"
            className="rounded-[5px] bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary-hover"
          >
            Buat Laporan
          </Link>
          <Link
            href="/peta"
            className="rounded-[5px] border border-border px-6 py-3 font-semibold transition hover:bg-black/5 dark:hover:bg-white/10"
          >
            Lihat Peta Laporan
          </Link>
        </div>

        <div className="mx-auto mt-12 grid max-w-md grid-cols-2 gap-4">
          <div className="rounded-[5px] border border-border bg-card p-6">
            <p className="text-3xl font-extrabold text-primary">{total ?? 0}</p>
            <p className="text-sm text-muted">Total Laporan</p>
          </div>
          <div className="rounded-[5px] border border-border bg-card p-6">
            <p className="text-3xl font-extrabold text-green-500">{selesai ?? 0}</p>
            <p className="text-sm text-muted">Selesai Ditangani</p>
          </div>
        </div>

        <p className="mt-6 text-xs text-muted">
          Data laporan terbuka untuk umum —{" "}
          <a href="/api/public-data" className="font-medium text-primary hover:underline">
            JSON
          </a>{" "}
          ·{" "}
          <a
            href="/api/public-data?format=geojson"
            className="font-medium text-primary hover:underline"
          >
            GeoJSON
          </a>
        </p>
      </section>

      <section className="border-t border-border bg-black/2 py-16 dark:bg-white/2">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-center text-2xl font-bold">Bagaimana Cara Kerjanya?</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              { title: "Foto & Deskripsikan", desc: "Ambil foto masalah dan jelaskan kondisinya." },
              { title: "AI Mengklasifikasi", desc: "Gemini AI menentukan kategori & urgensi otomatis." },
              { title: "Tandai Lokasi", desc: "Pin lokasi kejadian pada peta interaktif." },
              { title: "Pantau Progres", desc: "Ikuti status penanganan hingga selesai secara transparan." },
            ].map((step) => (
              <div key={step.title} className="rounded-[5px] border border-border bg-card p-6 text-center">
                <h3 className="font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {recent.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 py-16">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Laporan Terbaru</h2>
            <Link href="/peta" className="text-sm font-medium text-primary">
              Lihat semua →
            </Link>
          </div>
          <div className="space-y-4">
            {recent.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                currentUserId={userData.user?.id ?? null}
                showReporter
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
