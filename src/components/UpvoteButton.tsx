"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function UpvoteButton({
  reportId,
  initialCount,
  userId,
}: {
  reportId: string;
  initialCount: number;
  userId: string | null;
}) {
  const router = useRouter();
  const [count, setCount] = useState(initialCount);
  const [upvoted, setUpvoted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    supabase
      .from("report_upvotes")
      .select("report_id", { count: "exact", head: true })
      .eq("report_id", reportId)
      .eq("user_id", userId)
      .then(({ count: existing }) => setUpvoted((existing ?? 0) > 0));
  }, [reportId, userId]);

  async function handleClick() {
    if (!userId) {
      toast.info("Masuk terlebih dahulu untuk mendukung laporan ini.");
      router.push("/login");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    if (upvoted) {
      const { error } = await supabase
        .from("report_upvotes")
        .delete()
        .eq("report_id", reportId)
        .eq("user_id", userId);
      if (!error) {
        setUpvoted(false);
        setCount((c) => Math.max(c - 1, 0));
      }
    } else {
      const { error } = await supabase
        .from("report_upvotes")
        .insert({ report_id: reportId, user_id: userId });
      if (!error) {
        setUpvoted(true);
        setCount((c) => c + 1);
      }
    }
    setLoading(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
        upvoted
          ? "border-primary bg-primary/10 text-primary dark:text-primary-light"
          : "border-border hover:bg-black/5 dark:hover:bg-white/10"
      }`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={upvoted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        className="h-3.5 w-3.5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0-6 6m6-6 6 6" />
      </svg>
      {count} Dukungan
    </button>
  );
}
