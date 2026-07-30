export type UserRole = "warga" | "admin";

export type ReportCategory =
  | "jalan"
  | "sampah"
  | "penerangan"
  | "drainase"
  | "fasilitas_umum"
  | "lainnya";

export type ReportUrgency = "rendah" | "sedang" | "tinggi";

export type ReportStatus = "diterima" | "diproses" | "selesai" | "ditolak";

export type Profile = {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
};

export type Report = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  photo_url: string | null;
  lat: number;
  lng: number;
  address: string | null;
  category: ReportCategory;
  urgency: ReportUrgency;
  ai_reasoning: string | null;
  status: ReportStatus;
  upvote_count: number;
  created_at: string;
  updated_at: string;
  reporter_name?: string | null;
};

export type ReportStatusHistory = {
  id: string;
  report_id: string;
  status: ReportStatus;
  note: string | null;
  changed_by: string | null;
  created_at: string;
};

export type ClassifyResult = {
  category: ReportCategory;
  urgency: ReportUrgency;
  reasoning: string;
};

export type DuplicateCandidate = {
  id: string;
  title: string;
  description: string;
  distanceMeters: number;
};

export type DuplicateCheckResult = {
  duplicateId: string | null;
  reason: string;
};
