"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import type { Report, ReportCategory, ReportStatus } from "@/lib/types";
import {
  CATEGORY_OPTIONS,
  STATUS_COLORS,
  STATUS_OPTIONS,
} from "@/lib/constants";
import { CategoryBadge, UrgencyBadge } from "./Badges";
import { formatDate } from "@/lib/utils";
import { ExportButtons } from "./ExportButtons";
import { StatsCharts } from "./StatsCharts";
import { computePriorityScore, rankByPriority } from "@/lib/priority";

export function AdminReportsTable({ initialReports }: { initialReports: Report[] }) {
  const [reports, setReports] = useState(initialReports);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ReportCategory | "semua">("semua");
  const [status, setStatus] = useState<ReportStatus | "semua">("semua");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const topPriority = useMemo(() => rankByPriority(reports).slice(0, 5), [reports]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reports.filter((r) => {
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.address ?? "").toLowerCase().includes(q);
      const matchesCategory = category === "semua" || r.category === category;
      const matchesStatus = status === "semua" || r.status === status;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [reports, search, category, status]);

  async function handleStatusChange(reportId: string, newStatus: ReportStatus) {
    setUpdatingId(reportId);
    const supabase = createClient();
    const { error } = await supabase
      .from("reports")
      .update({ status: newStatus })
      .eq("id", reportId);
    setUpdatingId(null);

    if (error) {
      toast.error("Gagal memperbarui status: " + error.message);
      return;
    }

    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r)),
    );
    toast.success("Status laporan diperbarui.");
  }

  return (
    <div className="flex flex-col gap-6">
      <StatsCharts reports={reports} />

      {topPriority.length > 0 && (
        <div className="rounded-[5px] border border-border bg-card p-4">
          <h3 className="mb-1 text-sm font-semibold">Top 5 Prioritas Penanganan</h3>
          <p className="mb-3 text-xs text-muted">
            Diurutkan otomatis dari urgensi, jumlah dukungan warga, dan lama laporan belum ditangani.
          </p>
          <div className="space-y-2">
            {topPriority.map((report, i) => (
              <button
                key={report.id}
                type="button"
                onClick={() => setExpandedId(report.id)}
                className="flex w-full items-center justify-between gap-3 rounded-[5px] border border-border px-3 py-2 text-left text-sm transition hover:bg-black/5 dark:hover:bg-white/5"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] bg-primary text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <span className="truncate font-medium">{report.title}</span>
                </span>
                <span className="shrink-0 text-xs text-muted">
                  Skor {computePriorityScore(report).toFixed(1)}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-[5px] border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="flex flex-wrap gap-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari judul, deskripsi, alamat..."
              className="w-56 rounded-[5px] border border-border bg-transparent px-3 py-1.5 text-sm outline-none focus:border-primary"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ReportCategory | "semua")}
              className="rounded-[5px] border border-border bg-card px-2 py-1.5 text-sm"
            >
              <option value="semua">Semua Kategori</option>
              {CATEGORY_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ReportStatus | "semua")}
              className="rounded-[5px] border border-border bg-card px-2 py-1.5 text-sm"
            >
              <option value="semua">Semua Status</option>
              {STATUS_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <ExportButtons reports={filtered} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-2">Laporan</th>
                <th className="px-4 py-2">Pelapor</th>
                <th className="px-4 py-2">Dukungan</th>
                <th className="px-4 py-2">Tanggal</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((report) => (
                <>
                  <tr
                    key={report.id}
                    className="cursor-pointer border-b border-border last:border-b-0 hover:bg-black/5 dark:hover:bg-white/5"
                    onClick={() =>
                      setExpandedId(expandedId === report.id ? null : report.id)
                    }
                  >
                    <td className="max-w-xs px-4 py-3">
                      <p className="truncate font-medium">{report.title}</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <CategoryBadge category={report.category} />
                        <UrgencyBadge urgency={report.urgency} />
                      </div>
                    </td>
                    <td className="px-4 py-3">{report.reporter_name ?? "-"}</td>
                    <td className="px-4 py-3">{report.upvote_count}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(report.created_at)}</td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={report.status}
                        disabled={updatingId === report.id}
                        onChange={(e) =>
                          handleStatusChange(report.id, e.target.value as ReportStatus)
                        }
                        style={{ color: STATUS_COLORS[report.status] }}
                        className="rounded-[5px] border border-border bg-card px-2 py-1 text-xs font-semibold"
                      >
                        {STATUS_OPTIONS.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {expandedId === report.id && (
                    <tr className="border-b border-border bg-black/[0.02] dark:bg-white/[0.03]">
                      <td colSpan={5} className="px-4 py-4">
                        <div className="flex flex-col gap-3 sm:flex-row">
                          {report.photo_url && (
                            <Image
                              src={report.photo_url}
                              alt={report.title}
                              width={160}
                              height={160}
                              className="h-40 w-40 shrink-0 rounded-[5px] object-cover"
                            />
                          )}
                          <div className="flex-1 space-y-2 text-sm">
                            <p>{report.description}</p>
                            {report.address && (
                              <p className="text-muted">{report.address}</p>
                            )}
                            <p className="text-xs text-muted">
                              Koordinat: {report.lat.toFixed(5)}, {report.lng.toFixed(5)}
                            </p>
                            {report.ai_reasoning && (
                              <p className="rounded-[5px] bg-primary/10 p-2 text-xs italic text-primary dark:text-primary-light">
                                Klasifikasi AI: {report.ai_reasoning}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-muted">
                    Tidak ada laporan yang cocok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
