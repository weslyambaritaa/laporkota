"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import type { Report, ReportStatusHistory } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/constants";
import { ReportCard } from "./ReportCard";
import { createClient } from "@/lib/supabase/client";
import { formatDate } from "@/lib/utils";

export function MyReportItem({
  report,
  currentUserId,
}: {
  report: Report;
  currentUserId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<ReportStatusHistory[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canEdit = report.status === "diterima";

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (next && !history) {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("report_status_history")
        .select("*")
        .eq("report_id", report.id)
        .order("created_at", { ascending: true });
      setHistory(data ?? []);
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Hapus laporan ini? Tindakan ini tidak dapat dibatalkan.")) {
      return;
    }
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.from("reports").delete().eq("id", report.id);
    setDeleting(false);
    if (error) {
      toast.error(error.message || "Gagal menghapus laporan.");
      return;
    }
    toast.success("Laporan berhasil dihapus.");
    router.refresh();
  }

  return (
    <div>
      <ReportCard report={report} currentUserId={currentUserId} />
      <div className="mt-1 flex flex-wrap items-center gap-3">
        <button
          onClick={toggle}
          className="text-xs font-medium text-primary hover:underline"
        >
          {open ? "Sembunyikan riwayat status" : "Lihat riwayat status"}
        </button>
        {canEdit && (
          <>
            <Link
              href={`/laporan/edit/${report.id}`}
              className="text-xs font-medium text-primary hover:underline"
            >
              Edit
            </Link>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs font-medium text-red-600 hover:underline disabled:opacity-60 dark:text-red-400"
            >
              {deleting ? "Menghapus..." : "Hapus"}
            </button>
          </>
        )}
      </div>

      {open && (
        <div className="mt-2 space-y-2 rounded-lg border border-border bg-card p-3">
          {loading && <p className="text-xs text-muted">Memuat riwayat...</p>}
          {!loading && history?.length === 0 && (
            <p className="text-xs text-muted">Belum ada riwayat status.</p>
          )}
          {history?.map((h) => (
            <div key={h.id} className="flex items-start gap-2 text-xs">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <div>
                <p className="font-medium">{STATUS_LABELS[h.status]}</p>
                <p className="text-muted">{formatDate(h.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
