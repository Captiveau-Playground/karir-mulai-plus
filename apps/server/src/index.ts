import { createContext } from "@karir-mulai-plus/api/context";
import { appRouter } from "@karir-mulai-plus/api/routers/index";
import { createAuth } from "@karir-mulai-plus/auth";
import { createDb } from "@karir-mulai-plus/db";
import { user } from "@karir-mulai-plus/db/schema/auth";
import { env } from "@karir-mulai-plus/env/server";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => createAuth().handler(c.req.raw));

/**
 * Seeder admin — buat user admin pertama jika belum ada.
 * Diproteksi oleh secret ADMIN_SEED_KEY (bukan untuk publik).
 *
 *   curl -X POST {API}/api/seed/admin \
 *     -H "x-seed-key: {ADMIN_SEED_KEY}" \
 *     -H "Content-Type: application/json" \
 *     -d '{"email":"admin@mulaiplus.id","password":"...","name":"Admin MULAI+"}'
 */
app.post("/api/seed/admin", async (c) => {
  const key = c.req.header("x-seed-key");
  if (!env.ADMIN_SEED_KEY || key !== env.ADMIN_SEED_KEY) {
    return c.json({ success: false, error: "Unauthorized" }, 401);
  }

  const body = await c.req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const name = String(body.name ?? "Admin MULAI+").trim();

  if (!email || !password || password.length < 8) {
    return c.json(
      { success: false, error: "email & password (min 8 char) wajib diisi" },
      400,
    );
  }

  const db = createDb();
  const existing = await db.select({ id: user.id }).from(user).where(eq(user.email, email));

  if (existing.length > 0) {
    // User sudah ada → pastikan role-nya admin (idempotent)
    await db.update(user).set({ role: "admin" }).where(eq(user.email, email));
    return c.json({ success: true, message: "admin sudah ada, role dipastikan admin", email });
  }

  const auth = createAuth();
  try {
    await auth.api.signUpEmail({
      body: { email, password, name },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "gagal membuat admin";
    return c.json({ success: false, error: message }, 400);
  }

  const created = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(user.email, email));
  if (created[0]) {
    await db.update(user).set({ role: "admin" }).where(eq(user.id, created[0].id));
  }

  return c.json({ success: true, message: "admin dibuat", email, userId: created[0]?.id });
});

export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

app.use("/*", async (c, next) => {
  const context = await createContext({ context: c });

  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: context,
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: "/api-reference",
    context: context,
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
