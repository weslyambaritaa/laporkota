# 🏙️ LaporKota

**Platform pelaporan warga untuk masalah infrastruktur & lingkungan kota, dengan klasifikasi otomatis berbasis AI dan peta transparansi real-time.**

Dibuat untuk kompetisi **Web Development — ITechno Cup 2026** (Kategori Mahasiswa).
Subtema: *Smart Sustainable Digital Solution for Inclusive Society* — SDG 11 (Kota dan Komunitas Berkelanjutan) & SDG 9 (Industri, Inovasi, dan Infrastruktur).

---

## 1. Penjelasan Aplikasi

### Latar Belakang

Warga sering menemukan masalah infrastruktur atau lingkungan di sekitar tempat tinggal/kampus mereka — jalan berlubang, lampu jalan mati, tumpukan sampah, saluran air tersumbat, fasilitas umum rusak — tetapi tidak ada saluran pelaporan yang terstruktur, transparan, dan mudah dipantau. Laporan sering hilang di grup chat tanpa tindak lanjut yang jelas, dan pengelola (RT/RW, pengelola kampus, dinas terkait) tidak memiliki data terpusat untuk memprioritaskan penanganan.

### Tujuan

LaporKota hadir sebagai platform digital yang menjembatani warga dan pengelola kawasan melalui:

- Pelaporan yang cepat dan mudah (foto + deskripsi + lokasi)
- **Klasifikasi otomatis berbasis AI (Google Gemini)** untuk kategori & tingkat urgensi laporan, mempercepat proses triase
- **Peta transparansi publik real-time** agar warga dapat memantau status penanganan laporan siapa pun, bukan hanya laporannya sendiri
- **Dashboard admin** dengan statistik, filter, dan riwayat status untuk pengambilan keputusan berbasis data

Studi kasus awal difokuskan pada lingkungan kampus/kota (dapat disesuaikan ke wilayah mana pun karena peta bersifat global), selaras dengan SDG 11 (kota & komunitas berkelanjutan yang inklusif) dan SDG 9 (penerapan smart technology pada infrastruktur).

---

## 2. Fitur Utama

| Fitur | Deskripsi |
|---|---|
| 🔐 **Autentikasi Peran** | Warga & Admin, dengan RLS (Row Level Security) di level database |
| 📝 **Form Lapor Cerdas** | Judul, deskripsi, upload foto, geolokasi otomatis/pin manual di peta |
| 🤖 **Klasifikasi AI (Gemini)** | Otomatis menentukan kategori & urgensi dari foto + teks laporan, lengkap dengan alasan singkat, tetap dapat dikoreksi manual oleh pelapor |
| 🗺️ **Peta Transparansi Publik** | Semua laporan tampil di peta interaktif (Leaflet + OpenStreetMap), dapat difilter per kategori/status, tanpa perlu login |
| 📊 **Dashboard Admin** | Statistik (grafik kategori & status), tabel laporan dengan pencarian/filter, ubah status laporan, lihat detail lengkap |
| 🔔 **Notifikasi Real-time** | Pelapor mendapat notifikasi langsung (toast + bel notifikasi) saat status laporannya berubah, via Supabase Realtime |
| 👍 **Dukungan Warga (Upvote)** | Warga lain dapat memberi dukungan pada laporan yang relevan, menandakan prioritas |
| 🕓 **Riwayat Status** | Setiap laporan memiliki linimasa perubahan status yang tercatat otomatis |
| 📤 **Ekspor Data** | Admin dapat mengekspor data laporan (terfilter) ke CSV & PDF |
| 🌗 **Mode Gelap & Responsif** | Tampilan menyesuaikan preferensi sistem, mobile-friendly, dan dapat diinstal sebagai PWA |

---

## 3. Teknologi yang Digunakan

| Teknologi | Peruntukan |
|---|---|
| **Next.js 16 (App Router, TypeScript)** | Framework utama full-stack — Server Components untuk data fetching, Route Handlers untuk endpoint API |
| **Tailwind CSS v4** | Styling utility-first, termasuk dark mode berbasis class |
| **Supabase (Postgres + Auth + Storage + Realtime)** | Database relasional, autentikasi pengguna, penyimpanan foto laporan, serta notifikasi real-time via Postgres Changes |
| **@supabase/ssr** | Sinkronisasi sesi autentikasi antara Server Component, Client Component, dan Proxy (middleware) Next.js |
| **Google Gemini API (`gemini-2.0-flash`, tier gratis)** | Klasifikasi otomatis kategori & urgensi laporan dari teks + gambar |
| **React Leaflet + OpenStreetMap** | Peta interaktif open-source (pemilihan lokasi & peta transparansi publik) tanpa API key berbayar |
| **Recharts** | Visualisasi statistik (bar chart & pie chart) di dashboard admin |
| **next-themes** | Manajemen mode gelap/terang |
| **sonner** | Notifikasi toast |
| **papaparse & jsPDF** | Ekspor data laporan ke CSV dan PDF |
| **Nominatim (OpenStreetMap)** | Reverse geocoding — mengisi alamat otomatis dari koordinat |

---

## 4. Cara Instalasi

### Prasyarat

- Node.js ≥ 20.9
- Akun [Supabase](https://supabase.com) (gratis)
- API key [Google Gemini](https://aistudio.google.com/apikey) (gratis)

### Langkah-langkah

1. **Clone repository & install dependency**

   ```bash
   git clone <url-repository-ini>
   cd ITechnoCUp
   npm install
   ```

2. **Buat project Supabase baru**, lalu buka **SQL Editor** dan jalankan seluruh isi file [`supabase/schema.sql`](supabase/schema.sql). Skrip ini akan membuat seluruh tabel, RLS policy, trigger, serta storage bucket `report-photos` secara otomatis.

3. **Salin file environment variable**

   ```bash
   cp .env.local.example .env.local
   ```

   Lalu isi nilainya:

   | Variabel | Lokasi didapat |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard → Project Settings → API |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API |
   | `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |

4. **Jalankan aplikasi secara lokal**

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000).

5. **(Opsional) Membuat akun Admin** — akun baru selalu berperan sebagai *Warga* secara default (demi keamanan, role tidak dapat ditentukan sendiri dari form registrasi). Untuk menjadikan sebuah akun sebagai Admin, daftar seperti biasa lalu jalankan query berikut di Supabase SQL Editor:

   ```sql
   update public.profiles set role = 'admin' where id = '<user-id-dari-tabel-auth.users>';
   ```

---

## 5. Cara Penggunaan

**Sebagai Warga:**

```text
1. Daftar/masuk melalui halaman /register atau /login
2. Klik "Buat Laporan" pada navbar atau beranda
3. Isi judul & deskripsi masalah, unggah foto (opsional)
4. Klik "Klasifikasikan" agar AI menentukan kategori & urgensi otomatis
5. Tandai lokasi kejadian di peta (klik peta / geser pin / gunakan lokasi GPS)
6. Kirim laporan — pantau statusnya di halaman "Laporan Saya"
7. Dukung laporan warga lain melalui tombol "Dukungan" di halaman Peta
```

**Sebagai Admin** (`role = 'admin'`):

```text
1. Masuk, lalu buka menu "Dashboard Admin"
2. Lihat statistik laporan (grafik kategori & status)
3. Gunakan pencarian/filter untuk menemukan laporan tertentu
4. Klik baris laporan untuk melihat detail lengkap (foto, deskripsi, alasan AI)
5. Ubah status laporan langsung dari dropdown pada tabel
6. Ekspor data terfilter ke CSV/PDF untuk pelaporan lebih lanjut
```

---

## Struktur Proyek (ringkas)

```text
src/
├─ app/                  # Routing (App Router): halaman & API routes
│  ├─ api/classify/      # Route Handler pemanggilan Gemini API
│  ├─ admin/             # Dashboard admin (dilindungi role admin)
│  ├─ laporan/baru/      # Form buat laporan
│  ├─ laporan/saya/      # Riwayat laporan milik pengguna
│  ├─ peta/              # Peta transparansi publik
│  ├─ login/ register/   # Autentikasi
│  └─ manifest.ts        # PWA manifest
├─ components/           # Komponen UI (form, peta, dashboard, dsb.)
├─ lib/                  # Supabase client, Gemini helper, tipe & konstanta
└─ proxy.ts              # Proxy (middleware) Next.js 16 — refresh sesi & proteksi rute
supabase/
└─ schema.sql            # Skema database, RLS policy, trigger, storage bucket
```

## Catatan Deployment

Proyek ini direkomendasikan untuk di-deploy melalui **Vercel** (gratis, terintegrasi native dengan Next.js). Jangan lupa menambahkan ketiga environment variable di atas pada pengaturan project Vercel. Lihat detail di [`DEPLOYMENT.md`](DEPLOYMENT.md).

## Keamanan

Ancaman yang diantisipasi (brute force login, session hijacking, IDOR, privilege escalation, rate limit abuse, dsb.) beserta mitigasi konkretnya didokumentasikan lengkap di [`SECURITY.md`](SECURITY.md).

---

Dibuat untuk **ITechno Cup 2026** — Web Development, Kategori Mahasiswa.
