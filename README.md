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
cd apps/server && npx wrangler d1 migrations apply karir-mulai-plus-db --local
cd ../..
bun run dev        # web :3001 + server :3000 (wrangler dev)
```

> Catatan: dev/deploy memakai **wrangler** (alchemy hang di Bun 1.3.14).

## Deploy ke Cloudflare (wrangler)

```bash
# 1. Server (Hono + Better Auth + D1)
cd apps/server
bunx wrangler d1 migrations apply karir-mulai-plus-db --remote   # idempotent — aman diulang
bunx wrangler secret put BETTER_AUTH_SECRET                      # sekali saja
bunx wrangler deploy

# 2. Web (TanStack Start SSR)
cd ../web
bun run build        # menghasilkan dist/server/index.js + dist/client via @cloudflare/vite-plugin
bunx wrangler deploy
```

Custom domain: `api.mulaiplus.id` (server) & `app.mulaiplus.id` (web) — record DNS dibuat di dashboard Cloudflare (CNAME → workers.dev, proxy ON).

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
| `bun run deploy` | deploy server + web via wrangler |
