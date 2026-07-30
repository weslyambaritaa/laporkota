import type { Metadata } from "next";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "LaporKota — Lapor Masalah Kota, Tuntas Bersama",
  description:
    "Platform pelaporan warga untuk masalah infrastruktur dan lingkungan kota, dengan klasifikasi otomatis berbasis AI dan peta transparansi real-time. ITechno Cup 2026.",
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border px-4 py-6 text-center text-sm text-muted">
            LaporKota — By Kilijum Team
          </footer>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
