import Link from "next/link";
import { getSessionProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MyReportItem } from "@/components/MyReportItem";
import type { Report } from "@/lib/types";

export const metadata = {
  title: "Laporan Saya — LaporKota",
};

export const dynamic = "force-dynamic";

export default async function MyReportsPage() {
  const session = await getSessionProfile();
  if (!session) return null; // proxy already redirects unauthenticated users

  const supabase = await createClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", session.userId)
    .order("created_at", { ascending: false });

  const list = (reports ?? []) as Report[];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Laporan Saya</h1>
          <p className="text-sm text-muted">
            {list.length} laporan telah Anda buat
          </p>
        </div>
        <Link
          href="/laporan/baru"
          className="rounded-[5px] bg-primary px-3 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          + Lapor Baru
        </Link>
      </div>

      {list.length === 0 ? (
        <div className="rounded-[5px] border border-dashed border-border p-10 text-center text-sm text-muted">
          Anda belum membuat laporan. Yuk mulai laporkan masalah di sekitar Anda!
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((report) => (
            <MyReportItem key={report.id} report={report} currentUserId={session.userId} />
          ))}
        </div>
      )}
    </div>
  );
}
