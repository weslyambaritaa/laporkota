"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

export function AfterPhotoUpload({
  reportId,
  currentUrl,
  onUploaded,
}: {
  reportId: string;
  currentUrl: string | null;
  onUploaded?: (url: string) => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      toast.error("Format foto harus JPG, PNG, WEBP, atau HEIC.");
      return;
    }
    if (file.size > MAX_PHOTO_SIZE_BYTES) {
      toast.error("Ukuran foto maksimal 5MB.");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${reportId}/after-${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("report-photos")
      .upload(path, file);
    if (uploadError) {
      setUploading(false);
      toast.error("Gagal upload foto: " + uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage.from("report-photos").getPublicUrl(path);
    const { error: updateError } = await supabase
      .from("reports")
      .update({ after_photo_url: publicUrlData.publicUrl })
      .eq("id", reportId);
    setUploading(false);

    if (updateError) {
      toast.error("Gagal menyimpan foto bukti: " + updateError.message);
      return;
    }

    toast.success("Foto bukti perbaikan tersimpan.");
    onUploaded?.(publicUrlData.publicUrl);
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold">Foto Bukti Perbaikan</span>
      {currentUrl && (
        <Image
          src={currentUrl}
          alt="Foto bukti perbaikan"
          width={160}
          height={160}
          className="h-32 w-32 rounded-[5px] border border-border object-cover"
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_PHOTO_TYPES.join(",")}
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="w-fit rounded-[5px] border border-border px-3 py-1.5 text-xs font-semibold transition hover:bg-black/5 disabled:opacity-60 dark:hover:bg-white/10"
      >
        {uploading ? "Mengunggah..." : currentUrl ? "Ganti Foto" : "Upload Foto Bukti"}
      </button>
    </div>
  );
}
