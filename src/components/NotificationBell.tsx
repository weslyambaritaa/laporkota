"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { STATUS_LABELS } from "@/lib/constants";
import type { ReportStatus } from "@/lib/types";
import { timeAgo } from "@/lib/utils";

type Notification = {
  id: string;
  reportTitle: string;
  status: ReportStatus;
  createdAt: string;
};

export function NotificationBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`reports-notify-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "reports",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const next = payload.new as { id: string; title: string; status: ReportStatus };
          const prev = payload.old as { status: ReportStatus };
          if (next.status === prev.status) return;

          const notification: Notification = {
            id: `${next.id}-${Date.now()}`,
            reportTitle: next.title,
            status: next.status,
            createdAt: new Date().toISOString(),
          };

          setNotifications((current) => [notification, ...current].slice(0, 20));
          setUnread((count) => count + 1);
          toast.info(
            `Laporan "${next.title}" kini berstatus ${STATUS_LABELS[next.status]}`,
          );
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        aria-label="Notifikasi"
        onClick={() => {
          setOpen((v) => !v);
          setUnread(0);
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border transition hover:bg-black/5 dark:hover:bg-white/10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path d="M12 2a6 6 0 0 0-6 6v3.09c0 .48-.17.94-.48 1.32L4.2 14.1a1.5 1.5 0 0 0 1.15 2.45h13.3a1.5 1.5 0 0 0 1.15-2.45l-1.32-1.69a2.1 2.1 0 0 1-.48-1.32V8a6 6 0 0 0-6-6Zm0 20a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Z" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-lg border border-border bg-card shadow-lg">
          <div className="border-b border-border px-4 py-2 text-sm font-semibold">
            Notifikasi Status Laporan
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-muted">
                Belum ada notifikasi baru.
              </p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="border-b border-border px-4 py-3 text-sm last:border-b-0">
                  <p className="font-medium">{n.reportTitle}</p>
                  <p className="text-muted">
                    Status berubah menjadi{" "}
                    <span className="font-semibold">{STATUS_LABELS[n.status]}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted">{timeAgo(n.createdAt)}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
