import { createClient } from "@/lib/supabase/server";
import { AdminReportsTable } from "@/components/AdminReportsTable";
import type { Report } from "@/lib/types";

export const metadata = {
  title: "Dashboard Admin — LaporKota",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const { data: reportsRaw } = await supabase
    .from("reports")
    .select("*, profiles!reports_user_id_fkey(full_name)")
    .order("created_at", { ascending: false });

  const reports: Report[] = (reportsRaw ?? []).map((r) => ({
    ...r,
    reporter_name: (r as { profiles?: { full_name: string } | null }).profiles
      ?.full_name,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard Admin</h1>
        <p className="text-sm text-muted">
          Kelola dan pantau seluruh laporan warga secara terpusat.
        </p>
      </div>
      <AdminReportsTable initialReports={reports} />
    </div>
  );
}
