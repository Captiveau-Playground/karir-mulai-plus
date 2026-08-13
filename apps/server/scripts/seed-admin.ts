/**
 * Seeder admin MULAI+ Career — panggil endpoint /api/seed/admin di server.
 *
 * Env vars:
 *   ADMIN_API_URL  (default https://api-prod.karir.mulaiplus.id)
 *   ADMIN_SEED_KEY (wajib — sama dengan secret di worker)
 *   ADMIN_EMAIL    (default admin@mulaiplus.id)
 *   ADMIN_PASSWORD (wajib — min 8 karakter)
 *   ADMIN_NAME     (default "Admin MULAI+")
 *
 * Contoh:
 *   ADMIN_SEED_KEY=xxx ADMIN_PASSWORD=rahasia123 bun run seed:admin
 *   ADMIN_SEED_KEY=xxx ADMIN_PASSWORD=rahasia123 bun run seed:admin:staging
 */

export {};

const apiUrl = (process.env.ADMIN_API_URL ?? "https://api-prod.karir.mulaiplus.id").replace(
  /\/$/,
  "",
);
const seedKey = process.env.ADMIN_SEED_KEY;
const email = (process.env.ADMIN_EMAIL ?? "admin@mulaiplus.id").trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME ?? "Admin MULAI+";

if (!seedKey) {
  console.error("❌ ADMIN_SEED_KEY wajib diisi (env).");
  process.exit(1);
}
if (!password || password.length < 8) {
  console.error("❌ ADMIN_PASSWORD wajib diisi, minimal 8 karakter (env).");
  process.exit(1);
}

console.log(`→ Seeding admin ke ${apiUrl}`);
console.log(`  email   : ${email}`);
console.log(`  name    : ${name}`);

const res = await fetch(`${apiUrl}/api/seed/admin`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-seed-key": seedKey,
  },
  body: JSON.stringify({ email, password, name }),
});

const body = (await res.json().catch(() => ({}))) as {
  success?: boolean;
  message?: string;
  error?: string;
};

if (res.ok && body.success) {
  console.log(`✅ ${body.message ?? "admin siap"}`);
} else {
  console.error(`❌ Gagal (HTTP ${res.status}): ${body.error ?? body.message ?? "unknown"}`);
  process.exit(1);
}
