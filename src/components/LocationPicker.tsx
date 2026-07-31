"use client";

import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { ensureLeafletDefaultIcon } from "@/lib/leafletIcons";

function ClickHandler({
  onChange,
}: {
  onChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Only re-centers when `trigger` changes (e.g. "Gunakan Lokasi Saya"), not
// on every lat/lng update — a plain map click/marker drag already keeps the
// clicked point in view, so re-centering there would just be disorienting.
function FlyToPosition({ lat, lng, trigger }: { lat: number; lng: number; trigger?: number }) {
  const map = useMap();
  useEffect(() => {
    if (trigger === undefined) return;
    map.flyTo([lat, lng], Math.max(map.getZoom(), 16), { duration: 0.75 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger]);
  return null;
}

export default function LocationPicker({
  lat,
  lng,
  onChange,
  flyTrigger,
}: {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
  flyTrigger?: number;
}) {
  useEffect(() => {
    ensureLeafletDefaultIcon();
  }, []);

  return (
    <div className="h-72 w-full overflow-hidden rounded-[5px] border border-border">
      <MapContainer
        center={[lat, lng]}
        zoom={15}
        className="h-full w-full"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={[lat, lng]}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const marker = e.target;
              const position = marker.getLatLng();
              onChange(position.lat, position.lng);
            },
          }}
        />
        <ClickHandler onChange={onChange} />
        <FlyToPosition lat={lat} lng={lng} trigger={flyTrigger} />
      </MapContainer>
    </div>
  );
}
