"use client";

import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Report } from "@/lib/types";
import { CATEGORY_LABELS, STATUS_LABELS, URGENCY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

function toRows(reports: Report[]) {
  return reports.map((r) => ({
    Judul: r.title,
    Kategori: CATEGORY_LABELS[r.category],
    Urgensi: URGENCY_LABELS[r.urgency],
    Status: STATUS_LABELS[r.status],
    Pelapor: r.reporter_name ?? "-",
    Alamat: r.address ?? "-",
    Dukungan: r.upvote_count,
    Tanggal: formatDate(r.created_at),
  }));
}

export function ExportButtons({ reports }: { reports: Report[] }) {
  function exportCsv() {
    const csv = Papa.unparse(toRows(reports));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `laporkota-laporan-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportPdf() {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Laporan LaporKota", 14, 16);
    const rows = toRows(reports);
    autoTable(doc, {
      startY: 22,
      head: [Object.keys(rows[0] ?? {})],
      body: rows.map((r) => Object.values(r)),
      styles: { fontSize: 7 },
      headStyles: { fillColor: [249, 115, 22] },
    });
    doc.save(`laporkota-laporan-${Date.now()}.pdf`);
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={exportCsv}
        disabled={reports.length === 0}
        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/10"
      >
        ⬇ Export CSV
      </button>
      <button
        onClick={exportPdf}
        disabled={reports.length === 0}
        className="rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-black/5 disabled:opacity-50 dark:hover:bg-white/10"
      >
        ⬇ Export PDF
      </button>
    </div>
  );
}
