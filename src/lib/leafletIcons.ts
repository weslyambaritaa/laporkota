import L from "leaflet";

let configured = false;

/** Leaflet's default marker images don't resolve correctly through bundlers;
 * point them at the CDN copy instead of relying on local asset imports. */
export function ensureLeafletDefaultIcon() {
  if (configured || typeof window === "undefined") return;
  configured = true;

  const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl:
      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

  L.Marker.prototype.options.icon = DefaultIcon;
}

export function coloredDivIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<span style="background:${color};width:16px;height:16px;display:block;border-radius:9999px;border:2px solid white;box-shadow:0 0 0 1px rgba(0,0,0,0.25)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
}
