import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  STATUS_COLORS,
  STATUS_LABELS,
  URGENCY_COLORS,
  URGENCY_LABELS,
} from "@/lib/constants";
import type { ReportCategory, ReportStatus, ReportUrgency } from "@/lib/types";

function Badge({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-[5px] px-2.5 py-1 text-xs font-semibold"
      style={{ backgroundColor: `${color}22`, color }}
    >
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

export function CategoryBadge({ category }: { category: ReportCategory }) {
  return <Badge color={CATEGORY_COLORS[category]} label={CATEGORY_LABELS[category]} />;
}

export function UrgencyBadge({ urgency }: { urgency: ReportUrgency }) {
  return <Badge color={URGENCY_COLORS[urgency]} label={`Urgensi ${URGENCY_LABELS[urgency]}`} />;
}

export function StatusBadge({ status }: { status: ReportStatus }) {
  return <Badge color={STATUS_COLORS[status]} label={STATUS_LABELS[status]} />;
}
