import Image from "next/image";
import type { Report } from "@/lib/types";
import { CategoryBadge, StatusBadge, UrgencyBadge } from "./Badges";
import { UpvoteButton } from "./UpvoteButton";
import { timeAgo } from "@/lib/utils";

export function ReportCard({
  report,
  currentUserId,
  showReporter = false,
}: {
  report: Report;
  currentUserId: string | null;
  showReporter?: boolean;
}) {
  return (
    <div className="flex gap-3 rounded-[5px] border border-border bg-card p-3">
      {report.photo_url ? (
        <Image
          src={report.photo_url}
          alt={report.title}
          width={96}
          height={96}
          className="h-24 w-24 shrink-0 rounded-[5px] object-cover"
        />
      ) : (
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[5px] bg-black/5 text-muted dark:bg-white/10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-8 w-8"
          >
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <circle cx="8.5" cy="9.5" r="1.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="m3 16 5-5 4 4 3-3 6 6" />
          </svg>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <CategoryBadge category={report.category} />
          <UrgencyBadge urgency={report.urgency} />
          <StatusBadge status={report.status} />
        </div>
        <h3 className="truncate font-semibold">{report.title}</h3>
        <p className="line-clamp-2 text-sm text-muted">{report.description}</p>
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <p className="text-xs text-muted">
            {showReporter && report.reporter_name ? `${report.reporter_name} · ` : ""}
            {timeAgo(report.created_at)}
          </p>
          <UpvoteButton
            reportId={report.id}
            initialCount={report.upvote_count}
            userId={currentUserId}
          />
        </div>
      </div>
    </div>
  );
}
