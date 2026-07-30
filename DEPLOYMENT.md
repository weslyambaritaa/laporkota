# Panduan Deployment — LaporKota

Panduan ini menjelaskan cara men-deploy LaporKota agar dapat diakses publik, sesuai ketentuan ITechno Cup 2026 (submit tautan repository GitHub **dan** tautan hosting).

## 1. Siapkan Supabase (backend)

1. Buat akun & project baru di [supabase.com](https://supabase.com) (gratis).
2. Buka **SQL Editor** → jalankan seluruh isi [`supabase/schema.sql`](supabase/schema.sql).
3. Buka **Project Settings → API**, catat:
   - `Project URL` → menjadi `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → menjadi `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Pastikan **Authentication → Providers → Email** aktif. Untuk mempercepat demo/testing, Anda bisa menonaktifkan sementara "Confirm email" di **Authentication → Sign In / Providers** agar akun langsung aktif tanpa verifikasi email.

## 2. Siapkan Gemini API Key

1. Buka [Google AI Studio](https://aistudio.google.com/apikey) dan buat API key gratis.
2. Simpan sebagai `GEMINI_API_KEY`.

## 3. Push ke GitHub

```bash
git init
git add .
git commit -m "Initial commit: LaporKota"
git branch -M main
git remote add origin <url-repo-github-anda>
git push -u origin main
```

> Pastikan file `.env.local` **tidak ikut ter-commit** (sudah diatur di `.gitignore`).

## 4. Deploy ke Vercel (direkomendasikan)

1. Buka [vercel.com/new](https://vercel.com/new) → Import repository GitHub ini.
2. Framework Preset akan otomatis terdeteksi sebagai **Next.js** — tidak perlu mengubah build command (`next build`) atau output directory.
3. Pada bagian **Environment Variables**, tambahkan ketiganya:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
4. Klik **Deploy**. Setelah selesai, Anda akan mendapatkan URL publik (`https://<nama-project>.vercel.app`).

### Alternatif: Netlify

1. Buka [app.netlify.com](https://app.netlify.com) → **Add new site → Import an existing project**.
2. Hubungkan repository GitHub ini. Netlify akan mendeteksi Next.js secara otomatis via `@netlify/plugin-nextjs`.
3. Tambahkan ketiga environment variable yang sama pada **Site settings → Environment variables**.
4. Deploy.

## 5. Setelah deploy

- Buka URL hasil deploy, coba alur lengkap: daftar akun → buat laporan → cek peta publik.
- Jadikan salah satu akun sebagai Admin (lihat langkah di `README.md` bagian 4.5) untuk mengakses `/admin`.
- Cantumkan **tautan repository GitHub** dan **tautan hosting** ini pada form submission ITechno Cup 2026.

## Troubleshooting Singkat

| Gejala | Kemungkinan Penyebab |
|---|---|
| Klasifikasi AI gagal / error 502 | `GEMINI_API_KEY` belum diisi di environment variable hosting, atau kuota free tier habis |
| Foto tidak muncul setelah upload | Storage bucket `report-photos` belum dibuat — jalankan ulang `supabase/schema.sql` |
| Redirect loop / tidak bisa login | Environment variable Supabase salah, atau proyek Supabase berbeda dari yang dipakai saat setup schema |
| Peta blank/putih | Pastikan koneksi internet aktif (tile peta dimuat dari OpenStreetMap) |
