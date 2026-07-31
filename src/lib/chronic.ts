import type { Report } from "./types";
import { haversineMeters } from "./geo";

// A "chronic spot" is a location that keeps generating reports of the same
// category over time — a strong signal the underlying problem was only
// ever patched, never actually fixed. This looks at ALL reports at a
// location regardless of current status (unlike duplicate detection, which
// only cares about currently-active ones): a spot that was marked "selesai"
// twice before and is being reported a third time is exactly the pattern
// this is meant to surface.
export const CHRONIC_RADIUS_METERS = 150;
export const CHRONIC_WINDOW_DAYS = 365;
export const CHRONIC_THRESHOLD = 3;

export type ChronicCluster = {
  key: string;
  category: Report["category"];
  reports: Report[];
  count: number;
};

function isWithinWindow(report: Report, now: number) {
  return now - new Date(report.created_at).getTime() <= CHRONIC_WINDOW_DAYS * 24 * 60 * 60 * 1000;
}

function isSameSpot(a: Report, b: Report) {
  return (
    a.category === b.category && haversineMeters(a.lat, a.lng, b.lat, b.lng) <= CHRONIC_RADIUS_METERS
  );
}

export function getChronicCount(target: Report, allReports: Report[], now: number = Date.now()): number {
  return allReports.filter((r) => isWithinWindow(r, now) && isSameSpot(r, target)).length;
}

export function isChronic(target: Report, allReports: Report[], now: number = Date.now()): boolean {
  return getChronicCount(target, allReports, now) >= CHRONIC_THRESHOLD;
}

// Builds one summary entry per distinct chronic location (greedy grouping —
// each report ends up in exactly one cluster) for use in overview panels.
export function findChronicClusters(allReports: Report[], now: number = Date.now()): ChronicCluster[] {
  const eligible = allReports
    .filter((r) => isWithinWindow(r, now))
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const clustered = new Set<string>();
  const clusters: ChronicCluster[] = [];

  for (const report of eligible) {
    if (clustered.has(report.id)) continue;
    const members = eligible.filter((r) => !clustered.has(r.id) && isSameSpot(r, report));
    if (members.length >= CHRONIC_THRESHOLD) {
      members.forEach((m) => clustered.add(m.id));
      clusters.push({
        key: report.id,
        category: report.category,
        reports: members,
        count: members.length,
      });
    }
  }

  return clusters.sort((a, b) => b.count - a.count);
}
