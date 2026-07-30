import { createClient } from "@/lib/supabase/server";
import { MapExplorer } from "@/components/MapExplorer";
import type { Report } from "@/lib/types";

export const metadata = {
  title: "Peta Laporan — LaporKota",
};

export const dynamic = "force-dynamic";

export default async function PetaPage() {
  const supabase = await createClient();

  const [{ data: reportsRaw }, { data: userData }] = await Promise.all([
    supabase
      .from("reports")
      .select("*, profiles!reports_user_id_fkey(full_name)")
      .order("created_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  const reports: Report[] = (reportsRaw ?? []).map((r) => ({
    ...r,
    reporter_name: (r as { profiles?: { full_name: string } | null }).profiles
      ?.full_name,
  }));

  return (
    <MapExplorer reports={reports} currentUserId={userData.user?.id ?? null} />
  );
}
