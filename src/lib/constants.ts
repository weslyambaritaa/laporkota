import type { ReportCategory, ReportStatus, ReportUrgency } from "./types";

export const CATEGORY_LABELS: Record<ReportCategory, string> = {
  jalan: "Jalan Rusak",
  sampah: "Sampah",
  penerangan: "Penerangan Jalan",
  drainase: "Drainase/Saluran Air",
  fasilitas_umum: "Fasilitas Umum",
  lainnya: "Lainnya",
};

export const CATEGORY_COLORS: Record<ReportCategory, string> = {
  jalan: "#f97316",
  sampah: "#84cc16",
  penerangan: "#eab308",
  drainase: "#0ea5e9",
  fasilitas_umum: "#8b5cf6",
  lainnya: "#64748b",
};

export const URGENCY_LABELS: Record<ReportUrgency, string> = {
  rendah: "Rendah",
  sedang: "Sedang",
  tinggi: "Tinggi",
};

export const URGENCY_COLORS: Record<ReportUrgency, string> = {
  rendah: "#22c55e",
  sedang: "#eab308",
  tinggi: "#ef4444",
};

export const STATUS_LABELS: Record<ReportStatus, string> = {
  diterima: "Diterima",
  diproses: "Diproses",
  selesai: "Selesai",
  ditolak: "Ditolak",
};

export const STATUS_COLORS: Record<ReportStatus, string> = {
  diterima: "#3b82f6",
  diproses: "#eab308",
  selesai: "#22c55e",
  ditolak: "#ef4444",
};

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS) as [
  ReportCategory,
  string,
][];

export const URGENCY_OPTIONS = Object.entries(URGENCY_LABELS) as [
  ReportUrgency,
  string,
][];

export const STATUS_OPTIONS = Object.entries(STATUS_LABELS) as [
  ReportStatus,
  string,
][];
