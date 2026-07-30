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
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-[5px] bg-black/5 text-2xl dark:bg-white/10">
          🏙️
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
