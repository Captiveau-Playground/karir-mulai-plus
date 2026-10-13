# MULAI+ Career Compass — Better T Stack

Platform akselerasi karier untuk mahasiswa → early professional (Indonesia):
**Assess → CV Audit → Career Path → Skill Quiz → Tracker Lamaran → Interview Prep → Mentor → Coach**.

Migrasi dari prototype TanStack Start (Lovable) ke [Better T Stack](https://www.better-t-stack.dev/)
monorepo: TanStack Start (web) + Hono (server) + oRPC + Better Auth + Drizzle + Cloudflare D1.

## Arsitektur

```
apps/web      TanStack Start SSR (React 19, Tailwind v4) — UI + local-first store (localStorage cache)
apps/server   Hono — oRPC (RPC + OpenAPI) + Better Auth (/api/auth/*)
packages/api  oRPC procedures (public/protected)
packages/auth Better Auth (Drizzle adapter → D1)
packages/db   Drizzle schema + D1 client
packages/ui   shadcn/ui (Base UI + komponen radix hasil migrasi)
packages/env  Env typing (cloudflare:workers)
packages/infra Alchemy deploy (Cloudflare Workers + D1)
```

## Jalankan lokal

```bash
bun install
# migrasi D1 lokal (sekali)
cd apps/server && bun run db:migrate:local
cd ../..
bun run dev        # web :3001 + server :3000 (wrangler dev + D1 lokal Miniflare)
```

> DB lokal = D1 Miniflare (file sqlite di `apps/server/.wrangler/state/v3/d1/`),
> terpisah dari DB produksi — aman untuk eksperimen. Guest mode jalan penuh tanpa login.
> Catatan: dev/deploy memakai **wrangler** (alchemy hang di Bun 1.3.14).

## Environments: Local / Staging / Production

| | Local | Staging | Production |
|---|---|---|---|
| Web URL | `http://localhost:3001` | `https://staging.karir.mulaiplus.id` | `https://karir.mulaiplus.id` |
| Server URL | `http://localhost:3000` | `https://api-stag.karir.mulaiplus.id` | `https://api-prod.karir.mulaiplus.id` |
| Worker web | — | `mulai-karir-web-staging` | `mulai-karir-web` |
| Worker server | — | `mulai-karir-server-staging` | `mulai-karir-server` |
| D1 | Miniflare (lokal) | `karir-mulai-plus-db-staging` | `karir-mulai-plus-db` |
| Web env file | `.env.local` | `.env.staging` + `vite.config.staging.ts` | `.env.production` |
| Server vars | `.dev.vars` | `[env.staging]` di wrangler.toml | `[vars]` di wrangler.toml |

### Deploy staging

```bash
# 1. Server — migrate D1 staging (sekali) + set secret (sekali) + deploy
cd apps/server
bun run db:migrate:staging
bun run secret:staging          # input BETTER_AUTH_SECRET
bun run deploy:staging

# 2. Web — build dengan URL staging + deploy
cd ../web
bun run deploy:staging
```

### Deploy production

```bash
cd apps/server && bunx wrangler d1 migrations apply karir-mulai-plus-db --remote   # idempotent
bunx wrangler secret put BETTER_AUTH_SECRET                      # sekali saja
bunx wrangler deploy
cd ../web
bun run deploy
```

> Build web meng-inject `VITE_SERVER_URL` saat build (`--mode staging` → `.env.staging`,
> default production → `.env.production`). Jangan lupa `bun run build` ulang setelah
> pindah env — `dist/` tidak dibagi antar env.

Custom domain (record DNS dibuat di dashboard Cloudflare, CNAME → workers.dev, proxy ON):
`api-prod.karir.mulaiplus.id` + `api-stag.karir.mulaiplus.id` (server),
`karir.mulaiplus.id` + `staging.karir.mulaiplus.id` (web).

## CI/CD (GitHub Actions — deploy via GH)

Workflow `.github/workflows/deploy.yml`:

| Trigger | Yang di-deploy |
|---|---|
| Push ke `main` | Production (`karir.mulaiplus.id` + `api-prod.karir.mulaiplus.id`) |
| Push ke `staging` | Staging (`staging.karir.mulaiplus.id` + `api-stag.karir.mulaiplus.id`) |
| Manual (`workflow_dispatch`) | Pilih `staging` / `production` |

**Secrets yang harus di-set di GitHub** (Settings → Environments → `staging` & `production`):

| Secret | Isi |
|---|---|
| `CLOUDFLARE_API_TOKEN` | API token Cloudflare (Edit Workers, D1, Workers Routes) |
| `CLOUDFLARE_ACCOUNT_ID` | `7b23b1f8e20fd9cb2a7ab0fa6df7021d` |
| `BETTER_AUTH_SECRET` | secret auth (sama untuk prod & staging, atau beda per env) |

> Pastikan kedua GitHub Environment (`staging`, `production`) punya 3 secrets di atas.
> Workflow otomatis: `check-types` → migrasi D1 → secret → deploy server → build web → deploy web.

## Sinkronisasi data (local-first)

- UI membaca **localStorage** (instan, offline).
- Saat login (Better Auth), data di-`pull` dari **D1** (`getMyData`) dan di-`push`
  (profil, audit, lamaran, booking) secara best-effort.
- Guest mode tetap berfungsi penuh tanpa akun.

## Auth & Admin

- **Auth**: Better Auth (email + password) — signup, signin, session via cookie `better-auth.session_token`.
- **Role**: kolom `role` di tabel `user` (`user` / `admin`), dikelola plugin admin Better Auth.
- **Router admin** (`/admin` di web): `listUsers`, `updateRole`, `setBan`, `stats` — semua via `adminProcedure` (butuh role `admin`, selain itu `403 FORBIDDEN`).
- **Halaman `/admin`**: daftar user + aksi ubah role / ban — hanya tampil untuk admin (menu Admin di dropdown Career OS).

### Seeder admin

```bash
# lokal (server dev jalan di :3000)
cd apps/server
ADMIN_SEED_KEY=local-seed-key-change-me ADMIN_PASSWORD=rahasia123 bun run seed:admin:local

# staging / production
ADMIN_SEED_KEY=<key> ADMIN_PASSWORD=<pass> bun run seed:admin          # production
ADMIN_SEED_KEY=<key> ADMIN_PASSWORD=<pass> bun run seed:admin:staging  # staging
```

Endpoint `POST /api/seed/admin` (diproteksi header `x-seed-key` == `ADMIN_SEED_KEY` secret)
— idempotent: buat admin jika belum ada, atau pastikan role admin jika sudah ada.
CI juga otomatis seed admin setelah deploy bila secret `ADMIN_EMAIL` + `ADMIN_PASSWORD` diset.

## Backoffice (Superadmin & Manager)

Backoffice di `/admin` (menu **Career OS → Backoffice**) mengelola semua konfigurasi dinamis app:

| Tab | Akses | Isi |
|---|---|---|
| Dashboard | semua | statistik platform + panduan |
| Market | manager+ | CRUD role, skill, gaji, hiring heat |
| Mentors | manager+ | CRUD daftar mentor |
| Career Paths | manager+ | CRUD jalur karier |
| Blog | manager+ | tulis/publish artikel |
| Master Data | manager+ | Role Options, Skill Options, Skill Quiz, Interview Questions, Roadmap Weeks, RIASEC |
| Landing | manager+ | hero stats, FAQ, CTA text |
| Gamifikasi | manager+ | XP reward per aksi, level threshold |
| Users | superadmin | kelola role (user/manager/admin) & ban |
| Audit | manager+ | riwayat semua perubahan (siapa, kapan, sebelum/sesudah) |

**Role**: `user` (default) → `manager` (kelola konten) → `admin` (superadmin, kelola user).
Penyimpanan: tabel `app_config` (JSON key-value), `blog_posts`, `config_audit_log` di D1.
Perubahan konfig langsung ter-reflect di halaman publik (market, mentors, blog) —
prioritas data: konfig backoffice > router server > mock.

## Scripts

| Script | Fungsi |
|---|---|
| `bun run dev` | web + server (dev) |
| `bun run build` | build semua |
| `bun run check-types` | typecheck semua |
| `bun run db:generate` | generate migrasi Drizzle |
| `bun run deploy` | deploy server + web (production) |
| `bun run deploy:staging` | deploy server + web (staging) |
| `bun run db:migrate:local` | migrasi D1 lokal |
| `bun run db:migrate:remote` | migrasi D1 production |
| `bun run db:migrate:staging` | migrasi D1 staging |
| `seed:admin` / `seed:admin:local` / `seed:admin:staging` (di `apps/server`) | seeder admin (production / local / staging) |
