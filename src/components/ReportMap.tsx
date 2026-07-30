"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import type { Report } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_LABELS, STATUS_LABELS, URGENCY_LABELS } from "@/lib/constants";
import { coloredDivIcon, ensureLeafletDefaultIcon } from "@/lib/leafletIcons";
import { HeatmapLayer } from "./HeatmapLayer";

const DEFAULT_CENTER: [number, number] = [-6.3705, 106.8272];

export default function ReportMap({
  reports,
  showHeatmap = false,
}: {
  reports: Report[];
  showHeatmap?: boolean;
}) {
  useEffect(() => {
    ensureLeafletDefaultIcon();
  }, []);

  const center: [number, number] =
    reports.length > 0 ? [reports[0].lat, reports[0].lng] : DEFAULT_CENTER;

  return (
    <MapContainer center={center} zoom={14} className="h-full w-full" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {showHeatmap && <HeatmapLayer reports={reports} />}
      {reports.map((report) => (
        <Marker
          key={report.id}
          position={[report.lat, report.lng]}
          icon={coloredDivIcon(CATEGORY_COLORS[report.category])}
        >
          <Popup>
            <div className="max-w-[220px] text-sm">
              <p className="font-semibold">{report.title}</p>
              <p className="mt-1 text-xs text-slate-600">
                {CATEGORY_LABELS[report.category]} · Urgensi {URGENCY_LABELS[report.urgency]}
              </p>
              <p className="mt-1 text-xs">Status: {STATUS_LABELS[report.status]}</p>
              {report.address && (
                <p className="mt-1 text-xs text-slate-500">{report.address}</p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
