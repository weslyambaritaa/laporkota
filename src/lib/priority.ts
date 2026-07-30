import type { Report, ReportUrgency } from "./types";

const URGENCY_WEIGHT: Record<ReportUrgency, number> = {
  rendah: 1,
  sedang: 2,
  tinggi: 3,
};

const DAY_MS = 24 * 60 * 60 * 1000;

// Only reports still awaiting action accumulate priority — once resolved or
// rejected there's nothing left to prioritize.
export function isActionable(report: Report): boolean {
  return report.status === "diterima" || report.status === "diproses";
}

// Weighted score combining how urgent the issue is, how many citizens back
// it, and how long it has sat unresolved — surfaces what admins should
// tackle first instead of just sorting by newest.
export function computePriorityScore(report: Report, now: number = Date.now()): number {
  if (!isActionable(report)) return 0;
  const daysPending = Math.max(0, (now - new Date(report.created_at).getTime()) / DAY_MS);
  return URGENCY_WEIGHT[report.urgency] * 3 + report.upvote_count * 2 + daysPending;
}

export function rankByPriority(reports: Report[]): Report[] {
  const now = Date.now();
  return [...reports]
    .filter(isActionable)
    .sort((a, b) => computePriorityScore(b, now) - computePriorityScore(a, now));
}
