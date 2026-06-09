# Setup WarungERP Lite

ERP untuk UMKM Food & Beverage — Next.js + Supabase.

## Prasyarat

- **Node.js** v20+
- **pnpm** (atau npm)
- **Akun Supabase** (free tier cukup)

## 1. Clone & Install

```bash
git clone <repo-url> warungerp-lite
cd warungerp-lite
pnpm install
```

## 2. Supabase Setup

### 2.1 Buat Project

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Klik **New Project**
3. Pilih organization, isi nama project (misal: `warungerp-lite`)
4. Pilih region terdekat (Southeast Asia: `ap-southeast-1`)
5. Pilih **Free** plan
6. Klik **Create Project** — tunggu ~2 menit

### 2.2 Setup Database Schema

1. Di Supabase Dashboard, buka **SQL Editor**
2. Klik **New Query**
3. Copy seluruh isi file `supabase-migration.sql` dari project ini
4. Paste ke SQL Editor, klik **Run**
5. Pastikan semua table muncul di **Table Editor** tanpa error

### 2.3 Setup Authentication

1. Buka **Authentication > Settings**
2. Di tab **Email**:
   - **Enable email confirmations** — ON (wajib untuk verifikasi email)
   - **Enable email/password** — ON
   - **Enable magic link** — OFF (opsional, tidak dipakai)

3. Di **Authentication > Email Templates**:
   - Klik **Confirm signup**
   - Ganti `{{ .ConfirmationURL }}` dengan:
     ```
     {{ .SiteURL }}/auth/callback?code={{ .TokenHash }}
     ```
   - Scroll ke bawah, klik **Save**

### 2.4 Konfigurasi Email (Penting!)

Default SMTP Supabase sering gagal deliver ke Gmail/inbox. Ganti dengan provider eksternal:

**Opsi A: Resend (Recommended — free 100 email/hari)**

1. Buka [Resend](https://resend.com), daftar akun gratis
2. **Add Domain** — pakai domain kamu atau `resend.dev` untuk testing
3. Buka **API Keys**, buat key baru, copy
4. Di Supabase: **Authentication > Settings > Email > SMTP Settings**
   - Host: `smtp.resend.com`
   - Port: `587`
   - Username: `resend`
   - Password: (paste API key dari Resend)

**Opsi B: SendGrid (free 100 email/hari)**

1. Buka [SendGrid](https://sendgrid.com), daftar akun gratis
2. Buat API key (Settings > API Keys > Create — pilih Restricted Access > Mail Send)
3. Di Supabase: **Authentication > Settings > Email > SMTP Settings**
   - Host: `smtp.sendgrid.net`
   - Port: `587`
   - Username: `apikey`
   - Password: (paste API key dari SendGrid)

### 2.5 Env Variables

1. Di Supabase Dashboard, buka **Settings > API**
2. Copy **Project URL** dan **anon public** key
3. Buat file `.env.local` di root project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

## 3. Jalankan App

```bash
pnpm dev
```

Buka `http://localhost:3000`

## 4. Register & Login

1. Buka `/auth/register`
2. Isi email + password, klik **Daftar**
3. Cek email — klik link verifikasi dari Supabase
4. Otomatis login dan redirect ke `/dashboard`

## Struktur Project

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/
│   │   ├── login/          # Login page (email + password)
│   │   ├── register/       # Registration page
│   │   ├── verify-email/   # Email verification sent page
│   │   └── callback/       # Auth callback handler
│   └── (app)/              # Authenticated app routes
│       └── dashboard/
├── components/             # Shared UI components
│   ├── ui/                 # Primitive UI (Button, Input, Card, dll)
│   └── layout/             # Layout components (Sidebar, Navbar)
├── features/               # Domain-specific modules
│   └── auth/               # Auth schemas (Zod)
├── lib/
│   └── supabase/           # Supabase clients (browser, server, middleware)
├── stores/                 # Zustand stores
├── providers/              # React context providers
├── services/               # Data access layer
└── types/                  # TypeScript type definitions
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm typecheck` | TypeScript type check |
| `pnpm lint` | Lint all files |

## Troubleshooting

### Email verifikasi tidak terkirim

- Cek **Authentication > Settings > Enable email confirmations** — harus ON
- Cek **SMTP Settings** — pastikan pakai Resend/SendGrid, jangan default Supabase
- Cek spam folder di email
- Free tier Supabase hanya 4 email/jam — tunggu kalau kena rate limit

### Redirect tidak jalan setelah klik link verifikasi

- Cek **Authentication > Email Templates > Confirm signup** — pastikan `ConfirmationURL` diganti formatnya seperti di langkah 2.3

### User tidak bisa insert data setelah login

- Pastikan `users` table di `public` schema terisi (trigger dari `auth.users`)
- Cek **SQL Editor** — pastikan `get_tenant_id()` function berjalan
- Jalankan manual: `insert into public.users (id, email, tenant_id, role) select id, email, (insert into public.tenants ...)` untuk user pertama

### Port 3000 sudah dipakai

```bash
pnpm dev -p 3001
```
