"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import {
  CATEGORY_OPTIONS,
  URGENCY_OPTIONS,
} from "@/lib/constants";
import type { Report, ReportCategory, ReportUrgency } from "@/lib/types";

const LocationPicker = dynamic(() => import("./LocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="flex h-72 w-full items-center justify-center rounded-[5px] border border-border text-sm text-muted">
      Memuat peta...
    </div>
  ),
});

const DEFAULT_CENTER = { lat: -6.3705, lng: 106.8272 }; // Politeknik Negeri Jakarta (default studi kasus)
const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5MB, matches the storage bucket limit
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1] ?? "");
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ReportForm({ report }: { report?: Report } = {}) {
  const isEdit = !!report;
  const router = useRouter();
  const [title, setTitle] = useState(report?.title ?? "");
  const [description, setDescription] = useState(report?.description ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    report?.photo_url ?? null,
  );
  const [lat, setLat] = useState(report?.lat ?? DEFAULT_CENTER.lat);
  const [lng, setLng] = useState(report?.lng ?? DEFAULT_CENTER.lng);
  const [address, setAddress] = useState(report?.address ?? "");
  const [category, setCategory] = useState<ReportCategory>(
    report?.category ?? "lainnya",
  );
  const [urgency, setUrgency] = useState<ReportUrgency>(
    report?.urgency ?? "sedang",
  );
  const [aiReasoning, setAiReasoning] = useState<string | null>(
    report?.ai_reasoning ?? null,
  );
  const [locating, setLocating] = useState(false);
  const [flyTrigger, setFlyTrigger] = useState(0);
  const [classifying, setClassifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [duplicateMatch, setDuplicateMatch] = useState<{ id: string; title: string } | null>(
    null,
  );
  const [duplicateReason, setDuplicateReason] = useState("");

  async function reverseGeocode(newLat: number, newLng: number) {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${newLat}&lon=${newLng}`,
        { headers: { Accept: "application/json" } },
      );
      if (!res.ok) return;
      const data = await res.json();
      if (data?.display_name) setAddress(data.display_name);
    } catch {
      // Reverse geocoding is a convenience feature only; ignore failures.
    }
  }

  function handleLocationChange(newLat: number, newLng: number) {
    setLat(newLat);
    setLng(newLng);
    reverseGeocode(newLat, newLng);
  }

  function handleUseMyLocation() {
    if (!navigator.geolocation) {
      toast.error("Perangkat Anda tidak mendukung geolokasi.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        handleLocationChange(position.coords.latitude, position.coords.longitude);
        setFlyTrigger((t) => t + 1);
        setLocating(false);
        toast.success("Lokasi berhasil diambil.");
      },
      () => {
        setLocating(false);
        toast.error("Gagal mengambil lokasi. Pastikan izin lokasi diaktifkan.");
      },
    );
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;

    if (file) {
      // Mirrors the storage bucket's file_size_limit/allowed_mime_types in
      // supabase/schema.sql — reject early instead of wasting an upload.
      if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
        toast.error("Format foto harus JPG, PNG, WEBP, atau HEIC.");
        e.target.value = "";
        return;
      }
      if (file.size > MAX_PHOTO_SIZE_BYTES) {
        toast.error("Ukuran foto maksimal 5MB.");
        e.target.value = "";
        return;
      }
    }

    setPhotoFile(file);
    setAiReasoning(null);
    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview(null);
    }
  }

  async function handleClassify() {
    if (!title.trim() || !description.trim()) {
      toast.error("Isi judul dan deskripsi terlebih dahulu.");
      return;
    }

    setClassifying(true);
    try {
      let photoBase64: string | undefined;
      let photoMimeType: string | undefined;
      if (photoFile) {
        photoBase64 = await fileToBase64(photoFile);
        photoMimeType = photoFile.type;
      }

      const res = await fetch("/api/classify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, photoBase64, photoMimeType }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Gagal mengklasifikasikan laporan.");
      }

      setCategory(data.category);
      setUrgency(data.urgency);
      setAiReasoning(data.reasoning);
      toast.success("Klasifikasi AI selesai — silakan periksa & sesuaikan jika perlu.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Terjadi kesalahan.");
    } finally {
      setClassifying(false);
    }
  }

  async function submitReport() {
    setSubmitting(true);
    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesi Anda telah berakhir, silakan masuk kembali.");

      let photoUrl: string | null = isEdit ? (report?.photo_url ?? null) : null;
      if (photoFile) {
        const ext = photoFile.name.split(".").pop() ?? "jpg";
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("report-photos")
          .upload(path, photoFile);
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("report-photos")
          .getPublicUrl(path);
        photoUrl = publicUrlData.publicUrl;
      }

      const payload = {
        title: title.trim(),
        description: description.trim(),
        photo_url: photoUrl,
        lat,
        lng,
        address: address || null,
        category,
        urgency,
        ai_reasoning: aiReasoning,
      };

      if (isEdit && report) {
        const { error: updateError } = await supabase
          .from("reports")
          .update(payload)
          .eq("id", report.id);
        if (updateError) throw updateError;
        toast.success("Laporan berhasil diperbarui.");
      } else {
        const { error: insertError } = await supabase
          .from("reports")
          .insert({ ...payload, user_id: user.id });
        if (insertError) throw insertError;
        toast.success("Laporan berhasil dikirim. Terima kasih!");
      }

      router.push(`/laporan/saya`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isEdit
            ? "Gagal memperbarui laporan."
            : "Gagal mengirim laporan.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Judul dan deskripsi wajib diisi.");
      return;
    }

    // Duplicate detection only matters for brand-new reports at a location —
    // editing an existing one can't be "a duplicate of itself".
    if (!isEdit) {
      setCheckingDuplicate(true);
      try {
        const res = await fetch("/api/check-duplicate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description, lat, lng, category }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.duplicate) {
            setDuplicateMatch(data.duplicate);
            setDuplicateReason(data.reason ?? "");
            setCheckingDuplicate(false);
            return;
          }
        }
      } catch {
        // Fail open — a hiccup in the convenience check shouldn't block submission.
      }
      setCheckingDuplicate(false);
    }

    await submitReport();
  }

  async function handleMergeIntoExisting() {
    if (!duplicateMatch) return;
    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Sesi Anda telah berakhir, silakan masuk kembali.");
      setSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from("report_upvotes")
      .insert({ report_id: duplicateMatch.id, user_id: user.id });
    setSubmitting(false);

    // 23505 = unique_violation: user already supported this report, which
    // for our purposes here is just as good as a fresh success.
    if (error && error.code !== "23505") {
      toast.error("Gagal memberi dukungan: " + error.message);
      return;
    }

    toast.success(`Dukungan ditambahkan ke laporan "${duplicateMatch.title}".`);
    router.push("/peta");
  }

  function handleSubmitAnyway() {
    setDuplicateMatch(null);
    void submitReport();
  }

  if (duplicateMatch) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-8">
        <div className="rounded-[5px] border border-primary bg-primary/10 p-5">
          <h2 className="text-lg font-semibold">Laporan Serupa Ditemukan</h2>
          <p className="mt-2 text-sm">
            AI mendeteksi laporan &quot;<strong>{duplicateMatch.title}</strong>&quot; kemungkinan
            menggambarkan masalah yang sama di lokasi ini.
          </p>
          {duplicateReason && (
            <p className="mt-1 text-xs italic text-muted">{duplicateReason}</p>
          )}
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleMergeIntoExisting}
              disabled={submitting}
              className="rounded-[5px] bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
            >
              {submitting ? "Memproses..." : "Gabung Dukungan ke Laporan Itu"}
            </button>
            <button
              type="button"
              onClick={handleSubmitAnyway}
              disabled={submitting}
              className="rounded-[5px] border border-border px-4 py-2 text-sm font-semibold transition hover:bg-black/5 disabled:opacity-60 dark:hover:bg-white/10"
            >
              {submitting ? "Mengirim..." : "Tetap Kirim Sebagai Laporan Baru"}
            </button>
            <button
              type="button"
              onClick={() => setDuplicateMatch(null)}
              disabled={submitting}
              className="rounded-[5px] px-4 py-2 text-sm font-medium text-muted hover:underline disabled:opacity-60"
            >
              Batal, Kembali Edit
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-2xl flex-col gap-5 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">
          {isEdit ? "Edit Laporan" : "Buat Laporan Baru"}
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isEdit
            ? "Perbarui detail laporan Anda selama belum diproses admin."
            : "Laporkan masalah infrastruktur atau lingkungan di sekitar Anda. AI akan membantu mengklasifikasikan kategori & tingkat urgensi laporan."}
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Judul Laporan
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Contoh: Lampu jalan mati di depan gedung P"
          className="rounded-[5px] border border-border bg-transparent px-3 py-2 outline-none focus:border-primary"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Deskripsi
        <textarea
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          placeholder="Jelaskan kondisi masalah secara detail..."
          className="rounded-[5px] border border-border bg-transparent px-3 py-2 outline-none focus:border-primary"
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Foto (opsional, membantu akurasi AI)</span>
        <input
          type="file"
          accept={ALLOWED_PHOTO_TYPES.join(",")}
          onChange={handlePhotoChange}
          className="text-sm"
        />
        {photoPreview && (
          <Image
            src={photoPreview}
            alt="Pratinjau foto laporan"
            width={400}
            height={240}
            unoptimized
            className="mt-1 h-48 w-full rounded-[5px] border border-border object-cover"
          />
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Lokasi Kejadian</span>
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={locating}
            className="rounded-[5px] border border-border px-3 py-1.5 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/10"
          >
            {locating ? "Mengambil lokasi..." : "Gunakan Lokasi Saya"}
          </button>
        </div>
        <LocationPicker
          lat={lat}
          lng={lng}
          onChange={handleLocationChange}
          flyTrigger={flyTrigger}
        />
        <p className="text-xs text-muted">
          Klik peta atau geser pin untuk menyesuaikan titik lokasi. Koordinat:{" "}
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Alamat (terisi otomatis, bisa diedit)"
          className="rounded-[5px] border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="rounded-[5px] border border-dashed border-primary p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Klasifikasi Otomatis dengan AI</p>
            <p className="text-xs text-muted">
              Gemini akan menentukan kategori & urgensi berdasarkan judul, deskripsi, dan foto.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClassify}
            disabled={classifying}
            className="shrink-0 rounded-[5px] bg-primary px-3 py-2 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
          >
            {classifying ? "Menganalisis..." : "Klasifikasikan"}
          </button>
        </div>
        {aiReasoning && (
          <p className="mt-3 rounded-[5px] bg-primary/10 p-2 text-xs italic text-primary dark:text-primary-light">
            {aiReasoning}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1 text-sm font-medium">
          Kategori
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as ReportCategory)}
            className="rounded-[5px] border border-border bg-card px-3 py-2 outline-none focus:border-primary"
          >
            {CATEGORY_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm font-medium">
          Urgensi
          <select
            value={urgency}
            onChange={(e) => setUrgency(e.target.value as ReportUrgency)}
            className="rounded-[5px] border border-border bg-card px-3 py-2 outline-none focus:border-primary"
          >
            {URGENCY_OPTIONS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting || checkingDuplicate}
        className="mt-2 rounded-[5px] bg-primary px-4 py-3 font-semibold text-white transition hover:bg-primary-hover disabled:opacity-60"
      >
        {checkingDuplicate
          ? "Mengecek laporan serupa..."
          : submitting
            ? isEdit
              ? "Menyimpan..."
              : "Mengirim..."
            : isEdit
              ? "Simpan Perubahan"
              : "Kirim Laporan"}
      </button>
    </form>
  );
}
