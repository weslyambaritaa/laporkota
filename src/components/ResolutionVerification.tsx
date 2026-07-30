"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export function ResolutionVerification({
  reportId,
  userId,
}: {
  reportId: string;
  userId: string | null;
}) {
  const router = useRouter();
  const [myVote, setMyVote] = useState<boolean | null>(null);
  const [confirmedCount, setConfirmedCount] = useState(0);
  const [disputedCount, setDisputedCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("report_resolution_confirmations")
      .select("user_id, confirmed")
      .eq("report_id", reportId)
      .then(({ data }) => {
        if (!data) return;
        setConfirmedCount(data.filter((d) => d.confirmed).length);
        setDisputedCount(data.filter((d) => !d.confirmed).length);
        setMyVote(userId ? (data.find((d) => d.user_id === userId)?.confirmed ?? null) : null);
      });
  }, [reportId, userId, refreshKey]);

  async function vote(confirmed: boolean) {
    if (!userId) {
      toast.info("Masuk terlebih dahulu untuk memberi verifikasi.");
      router.push("/login");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("report_resolution_confirmations")
      .upsert({ report_id: reportId, user_id: userId, confirmed }, { onConflict: "report_id,user_id" });
    setLoading(false);

    if (error) {
      toast.error("Gagal mengirim verifikasi: " + error.message);
      return;
    }

    toast.success(
      confirmed
        ? "Terima kasih atas konfirmasinya!"
        : "Ditandai masih bermasalah — laporan akan dibuka kembali jika cukup banyak yang membantah.",
    );
    setRefreshKey((k) => k + 1);
    router.refresh();
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border pt-2 text-xs">
      <span className="text-muted">Sudah benar diperbaiki?</span>
      <button
        type="button"
        onClick={() => vote(true)}
        disabled={loading}
        className={`rounded-[5px] border px-2 py-1 font-medium transition disabled:opacity-60 ${
          myVote === true
            ? "border-green-500 bg-green-500/10 text-green-600 dark:text-green-400"
            : "border-border hover:bg-black/5 dark:hover:bg-white/10"
        }`}
      >
        Ya ({confirmedCount})
      </button>
      <button
        type="button"
        onClick={() => vote(false)}
        disabled={loading}
        className={`rounded-[5px] border px-2 py-1 font-medium transition disabled:opacity-60 ${
          myVote === false
            ? "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400"
            : "border-border hover:bg-black/5 dark:hover:bg-white/10"
        }`}
      >
        Belum ({disputedCount})
      </button>
    </div>
  );
}
