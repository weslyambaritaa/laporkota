"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import type { Report, ReportCategory, ReportStatus } from "@/lib/types";
import { CATEGORY_OPTIONS, STATUS_OPTIONS } from "@/lib/constants";
import { ReportCard } from "./ReportCard";

const ReportMap = dynamic(() => import("./ReportMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center text-sm text-muted">
      Memuat peta...
    </div>
  ),
});

export function MapExplorer({
  reports,
  currentUserId,
}: {
  reports: Report[];
  currentUserId: string | null;
}) {
  const [category, setCategory] = useState<ReportCategory | "semua">("semua");
  const [status, setStatus] = useState<ReportStatus | "semua">("semua");

  const filtered = useMemo(
    () =>
      reports.filter(
        (r) =>
          (category === "semua" || r.category === category) &&
          (status === "semua" || r.status === status),
      ),
    [reports, category, status],
  );

  return (
    <div className="mx-auto flex h-[calc(100vh-8.5rem)] max-w-6xl flex-col gap-4 px-4 py-4 md:flex-row">
      <div className="flex shrink-0 flex-col gap-3 md:w-80">
        <div>
          <h1 className="text-xl font-bold">Peta Laporan Warga</h1>
          <p className="text-sm text-muted">
            {filtered.length} dari {reports.length} laporan ditampilkan
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ReportCategory | "semua")}
            className="rounded-lg border border-border bg-transparent px-2 py-1.5 text-xs"
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
            className="rounded-lg border border-border bg-transparent px-2 py-1.5 text-xs"
          >
            <option value="semua">Semua Status</option>
            {STATUS_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 space-y-3 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">
              Tidak ada laporan yang cocok dengan filter.
            </p>
          ) : (
            filtered.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                currentUserId={currentUserId}
                showReporter
              />
            ))
          )}
        </div>
      </div>

      <div className="min-h-[300px] flex-1 overflow-hidden rounded-lg border border-border">
        <ReportMap reports={filtered} />
      </div>
    </div>
  );
}
