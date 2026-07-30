import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LaporKota — Lapor Masalah Kota",
    short_name: "LaporKota",
    description:
      "Platform pelaporan warga untuk masalah infrastruktur & lingkungan kota dengan klasifikasi AI.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#f97316",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
