"use client";

import { useEffect, useRef } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import type { Marker as LeafletMarker } from "leaflet";
import type { Report } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_LABELS, STATUS_LABELS, URGENCY_LABELS } from "@/lib/constants";
import { coloredDivIcon, ensureLeafletDefaultIcon } from "@/lib/leafletIcons";
import { HeatmapLayer } from "./HeatmapLayer";

const DEFAULT_CENTER: [number, number] = [-6.3705, 106.8272];

function FlyToSelected({
  reports,
  selectedId,
  markerRefs,
}: {
  reports: Report[];
  selectedId?: string | null;
  markerRefs: React.RefObject<Map<string, LeafletMarker>>;
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedId) return;
    const target = reports.find((r) => r.id === selectedId);
    if (!target) return;
    map.flyTo([target.lat, target.lng], Math.max(map.getZoom(), 16), { duration: 0.75 });
    markerRefs.current.get(selectedId)?.openPopup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return null;
}

export default function ReportMap({
  reports,
  showHeatmap = false,
  chronicIds,
  selectedReportId,
}: {
  reports: Report[];
  showHeatmap?: boolean;
  chronicIds?: Set<string>;
  selectedReportId?: string | null;
}) {
  const markerRefs = useRef(new Map<string, LeafletMarker>());

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
      <FlyToSelected reports={reports} selectedId={selectedReportId} markerRefs={markerRefs} />
      {reports.map((report) => (
        <Marker
          key={report.id}
          ref={(instance) => {
            if (instance) markerRefs.current.set(report.id, instance);
            else markerRefs.current.delete(report.id);
          }}
          position={[report.lat, report.lng]}
          icon={coloredDivIcon(CATEGORY_COLORS[report.category], {
            chronic: chronicIds?.has(report.id),
          })}
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
              {chronicIds?.has(report.id) && (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  Titik kronis — sudah berulang kali dilaporkan di lokasi ini.
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
