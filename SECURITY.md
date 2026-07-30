# Keamanan — LaporKota

Dokumen ini memetakan kelas ancaman umum ke mitigasi yang benar-benar diimplementasikan di codebase ini (bukan sekadar daftar keinginan). Setiap baris menyebutkan file konkret agar bisa diverifikasi langsung.

## 1. Authentication & Session

| Ancaman | Mitigasi |
|---|---|
| **Brute force / credential stuffing pada login** | Client-side progressive lockout: setelah 5 percobaan gagal, form dikunci dengan backoff eksponensial (30s → maks 8 menit) — [`src/app/login/page.tsx`](src/app/login/page.tsx). Ini pelengkap, bukan pengganti, rate limiting bawaan GoTrue (Supabase Auth) di sisi server. **Rekomendasi operasional**: aktifkan CAPTCHA (hCaptcha/Turnstile) di Supabase Dashboard → Authentication → Attack Protection untuk perlindungan sisi server yang sebenarnya. |
| **Session hijacking (token dicuri via XSS/network sniffing)** | (a) Cookie sesi diberi `sameSite: "lax"` dan `secure: true` di production — [`src/lib/supabase/cookieOptions.ts`](src/lib/supabase/cookieOptions.ts) — mencegah token dikirim lewat HTTP polos. (b) Cookie session **sengaja tidak httpOnly** karena `@supabase/ssr` browser client perlu membacanya langsung dari `document.cookie`; pertahanan sesungguhnya terhadap pencurian token adalah mencegah XSS terjadi sama sekali — lihat bagian Injection di bawah + CSP di [`next.config.ts`](next.config.ts). |
| **Session fixation** | Token sesi selalu diterbitkan ulang oleh Supabase Auth saat `signInWithPassword`/`updateUser`; aplikasi tidak pernah menerima atau mempercayai token sesi dari sumber eksternal (mis. query string). `router.refresh()` dipanggil setelah login/logout agar Server Component memuat ulang state sesi yang benar. |
| **Password reset abuse (enumerasi email lewat pesan error berbeda)** | Alur lupa-sandi khusus dengan pesan sukses **seragam** terlepas dari apakah email terdaftar — [`src/app/lupa-sandi/page.tsx`](src/app/lupa-sandi/page.tsx), plus cooldown 60 detik antar-pengiriman agar tidak disalahgunakan untuk email-bombing. Pesan error "already registered" dari Supabase saat registrasi juga dinormalisasi agar tidak membocorkan status email — [`src/app/register/page.tsx`](src/app/register/page.tsx). |

## 2. Injection & Input

| Ancaman | Mitigasi |
|---|---|
| **SQL injection** | Semua akses data lewat Supabase query builder (PostgREST) yang selalu memparameterkan nilai — tidak ada satu pun raw SQL string yang dirakit dari input pengguna di kode aplikasi (`supabase/schema.sql` hanya dijalankan manual oleh admin, bukan dari input pengguna). |
| **XSS (stored/reflected)** | Seluruh konten buatan pengguna (judul, deskripsi, alamat, nama, alasan AI) dirender lewat JSX yang meng-escape otomatis — tidak ada `dangerouslySetInnerHTML` di manapun pada codebase. Sebagai pertahanan berlapis, [`next.config.ts`](next.config.ts) menerapkan **Content-Security-Policy** yang membatasi asal script/style/img/connect ke domain yang benar-benar dipakai. |
| **Command injection** | Tidak ada eksekusi shell command dari input pengguna di aplikasi manapun (tidak ada pemanggilan `child_process`). |

## 3. Authorization

| Ancaman | Mitigasi |
|---|---|
| **IDOR (Insecure Direct Object Reference)** | Seluruh akses tabel diproteksi Row Level Security (RLS) di level database, bukan hanya disembunyikan di UI — lihat `supabase/schema.sql`. Laporan memang publik-transparan by design (fitur peta), sementara update/delete dibatasi ke pemilik atau admin lewat policy, sehingga mengganti ID di request tidak memberi akses tambahan. |
| **Privilege escalation (user biasa akses fungsi admin)** | Dua celah nyata ditutup di `supabase/schema.sql`: (1) trigger `handle_new_user()` **tidak lagi mempercayai** `role` dari metadata signup milik client (dulunya bisa dieksploitasi lewat pemanggilan langsung endpoint Auth dengan `data: { role: 'admin' }`) — akun baru selalu `warga`. (2) Trigger `protect_profile_role()` memblokir setiap `UPDATE role` yang dilakukan lewat API terautentikasi kecuali oleh admin — sebelumnya policy `profiles_update_own` secara tidak sengaja mengizinkan user mengubah kolom `role` miliknya sendiri menjadi `admin`. |
| **Broken access control di API endpoint** | `/api/classify` mewajibkan sesi terautentikasi (401 jika tidak) — [`src/app/api/classify/route.ts`](src/app/api/classify/route.ts). Endpoint mutasi lain (update status, upvote) berjalan lewat Supabase client langsung yang tetap ditegakkan RLS di database — bukan API custom yang bisa lupa memvalidasi. |

## 4. Business Logic Abuse

| Ancaman | Mitigasi |
|---|---|
| **Rate limit abuse** | `/api/classify` (yang memanggil Gemini API berbayar-kuota) dibatasi rate limiter in-memory: 8 permintaan/5 menit per user + 30/5 menit per IP — [`src/lib/rateLimit.ts`](src/lib/rateLimit.ts). Keterbatasannya didokumentasikan langsung di kode: state per-instance, bukan global, sehingga untuk skala produksi disarankan upgrade ke Upstash Redis. |
| **Race condition pada fungsi "poin" (upvote)** | `report_upvotes` memakai **primary key gabungan** `(report_id, user_id)` — dua insert bersamaan dari user yang sama akan gagal di salah satunya karena constraint database, bukan mengandalkan cek "read-then-write" dari sisi aplikasi yang rentan race condition. Trigger `sync_upvote_count()` yang meng-update counter juga `security definer`, menjamin konsistensi terlepas dari RLS. |
| **Replay attack (kirim ulang request yang sama untuk keuntungan ganda)** | Upvote otomatis idempoten lewat primary key di atas — replay insert yang sama akan ditolak database. Tombol submit/upvote juga di-disable selama request berjalan untuk mencegah double-click di sisi UI (`ReportForm.tsx`, `UpvoteButton.tsx`). |

## 5. Availability

| Ancaman | Mitigasi |
|---|---|
| **DoS/DDoS — flood request ke endpoint tertentu** | Rate limiting di `/api/classify` (lihat di atas) melindungi endpoint termahal (memanggil Gemini). Perlindungan DDoS jaringan-luas berada di luar cakupan kode aplikasi — direkomendasikan mengandalkan proteksi bawaan platform hosting (Vercel/Cloudflare) di level produksi. |
| **Resource exhaustion (upload file besar berulang / query berat berulang)** | Ukuran foto dibatasi **di tiga lapis**: validasi client sebelum upload (maks 5MB, tipe JPG/PNG/WEBP/HEIC saja — [`src/components/ReportForm.tsx`](src/components/ReportForm.tsx)), `file_size_limit` + `allowed_mime_types` pada Supabase Storage bucket itu sendiri (`supabase/schema.sql`), dan payload `photoBase64` ke `/api/classify` dibatasi ukurannya lewat skema Zod agar sejalan dengan limit yang sama (`src/app/api/classify/route.ts`). Panjang teks (`title`, `description`, `address`) juga dibatasi lewat CHECK constraint di database, bukan cuma di form. |

## Catatan Umum

- **Environment variables** (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `GEMINI_API_KEY`) tidak pernah di-commit — lihat `.gitignore`. `GEMINI_API_KEY` khususnya hanya diakses dari kode server-side (`src/lib/gemini.ts`, dipanggil dari Route Handler), tidak pernah dikirim ke browser.
- **Security headers** (CSP, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`) diterapkan global lewat `next.config.ts`.
- Dokumen ini akan bertambah seiring fitur baru ditambahkan — jika ada endpoint atau tabel baru, tinjau kembali bagian Authorization & Business Logic Abuse di atas.
