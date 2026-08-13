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
cd apps/server && npx wrangler d1 execute my-better-t-app-db --local --file=../../packages/db/src/migrations/0000_sparkling_black_bolt.sql
cd ../..
bun run dev        # web :3001 + server :3000 (wrangler dev)
```

> Catatan: `alchemy dev` (orchestrasi deploy) crash pada Bun 1.3.14 — dev lokal memakai
> `wrangler dev` untuk server. Deploy tetap via alchemy saat versi stabil.

## Sinkronisasi data (local-first)

- UI membaca **localStorage** (instan, offline).
- Saat login (Better Auth), data di-`pull` dari **D1** (`getMyData`) dan di-`push`
  (profil, audit, lamaran, booking) secara best-effort.
- Guest mode tetap berfungsi penuh tanpa akun.

## Scripts

| Script | Fungsi |
|---|---|
| `bun run dev` | web + server (dev) |
| `bun run build` | build semua |
| `bun run check-types` | typecheck semua |
| `bun run db:generate` | generate migrasi Drizzle |
| `bun run deploy` | deploy via Alchemy (Cloudflare) |
