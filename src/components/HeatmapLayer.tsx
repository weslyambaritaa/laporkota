"use client";

import { Circle } from "react-leaflet";
import type { Report } from "@/lib/types";
import { computePriorityScore, isActionable } from "@/lib/priority";

// Green (low priority) -> red (high priority); overlapping circles blend
// naturally via each shape's own fill opacity, giving a "hot zone" look
// without depending on a canvas-heatmap plugin.
function heatColor(normalized: number) {
  const hue = 120 - Math.min(Math.max(normalized, 0), 1) * 120;
  return `hsl(${hue}, 85%, 50%)`;
}

export function HeatmapLayer({ reports }: { reports: Report[] }) {
  const now = Date.now();

  return (
    <>
      {reports.filter(isActionable).map((report) => {
        const normalized = Math.min(computePriorityScore(report, now) / 15, 1);
        const color = heatColor(normalized);
        return (
          <Circle
            key={report.id}
            center={[report.lat, report.lng]}
            radius={150 + normalized * 350}
            pathOptions={{ color, fillColor: color, fillOpacity: 0.3, stroke: false }}
            interactive={false}
          />
        );
      })}
    </>
  );
}
