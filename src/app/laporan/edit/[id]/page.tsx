import { notFound, redirect } from "next/navigation";
import { getSessionProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { ReportForm } from "@/components/ReportForm";
import type { Report } from "@/lib/types";

export const metadata = {
  title: "Edit Laporan — LaporKota",
};

export default async function EditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSessionProfile();
  if (!session) return null; // proxy already redirects unauthenticated users

  const supabase = await createClient();
  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .single<Report>();

  if (!report) notFound();
  if (report.user_id !== session.userId) redirect("/laporan/saya");
  if (report.status !== "diterima") redirect("/laporan/saya");

  return <ReportForm report={report} />;
}
