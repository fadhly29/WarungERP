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
3. Isi nama project (misal: `warungerp-lite`), password database
4. Pilih region terdekat (`ap-southeast-1` untuk Jakarta)
5. Pilih **Free** plan
6. Klik **Create Project** — tunggu ~2 menit

### 2.2 Setup Database

1. Buka **SQL Editor** di Supabase Dashboard
2. Klik **New Query**
3. Copy seluruh isi file `supabase-migration.sql`
4. Paste ke SQL Editor, klik **Run**
5. Pastikan semua table dan trigger muncul tanpa error

DB trigger `handle_new_user` akan otomatis membuat `tenants` + `users` row setiap ada user baru mendaftar. Tidak perlu setup manual.

### 2.3 Setup Authentication

**Matikan email confirmation (wajib):**

1. Buka **Authentication > Settings**
2. Di tab **Email**:
   - **Enable email confirmations** — **OFF**
   - **Enable email/password** — ON
   - **Enable magic link** — OFF

> ⚠️ Kalau email confirmations ON, user tidak bisa langsung login setelah daftar karena harus verifikasi email dulu.

### 2.4 Environment Variables

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
2. Isi **Nama Warung**, email, password → klik **Daftar**
3. Otomatis redirect ke halaman login dengan notifikasi sukses
4. Login dengan email dan password → langsung masuk dashboard

Tanpa email verifikasi. Tanpa magic link.

## Struktur Project

```
src/
├── app/
│   ├── auth/
│   │   ├── login/          # Email + password login
│   │   ├── register/       # Register dengan nama warung
│   │   └── callback/       # Auth callback (dipakai kalau email confirmation ON)
│   └── (app)/
│       └── dashboard/
├── components/
│   ├── ui/                 # Button, Input, Card, dll
│   └── layout/             # Sidebar, Navbar
├── features/
│   └── auth/               # Zod validation schemas
├── lib/
│   └── supabase/           # Browser/server/middleware clients
├── stores/                 # Zustand (auth store)
├── providers/              # AuthProvider, QueryProvider
├── services/               # Data access (Supabase RLS)
└── types/                  # TypeScript types
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Dev server (localhost:3000) |
| `pnpm build` | Production build |
| `pnpm start` | Production server |
| `pnpm typecheck` | TypeScript check |
| `pnpm lint` | ESLint |

## Troubleshooting

### "Email not confirmed" saat login

Cek **Authentication > Settings > Email** — **Enable email confirmations** harus **OFF**.

### User tidak bisa akses data setelah login

Pastikan trigger `on_auth_user_created` berjalan. Cek di **Table Editor**:
1. Buka `auth.users` — pastikan user muncul
2. Buka `public.tenants` — pastikan tenant dibuat
3. Buka `public.users` — pastikan row dengan `id` yang sama muncul

Kalau kosong (misal user dari sebelum trigger ditambahkan), jalankan ini di **SQL Editor**:

```sql
insert into public.tenants (name, slug)
select email, email || '-' || substring(md5(random()::text) from 1 for 6)
from auth.users au
where not exists (select 1 from public.users u where u.id = au.id);

insert into public.users (id, email, tenant_id, role)
select au.id, au.email, t.id, 'owner'
from auth.users au
join public.tenants t on t.name = au.email
where not exists (select 1 from public.users u where u.id = au.id);
```

### Port 3000 sudah dipakai

```bash
pnpm dev -p 3001
```

### Supabase free tier limit

- 2 projects
- 500MB database
- 50.000 monthly active users
- Rate limit signup: 4 request/jam
