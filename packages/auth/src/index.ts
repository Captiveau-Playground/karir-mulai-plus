import { createDb } from "@karir-mulai-plus/db";
import * as schema from "@karir-mulai-plus/db/schema/auth";
import { env } from "@karir-mulai-plus/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, createAccessControl } from "better-auth/plugins";

/**
 * Access control MULAI+ Career:
 * - user  : akses default (login, data pribadi)
 * - admin : kelola user, lihat semua data, akses dashboard admin
 */
const statement = {
  user: ["read:own", "update:own", "delete:own"],
  admin: ["read:any", "update:any", "delete:any", "manage:users", "manage:data"],
} as const;

const ac = createAccessControl(statement);

const adminRole = ac.newRole({
  user: ["read:own", "update:own", "delete:own"],
  admin: ["read:any", "update:any", "delete:any", "manage:users", "manage:data"],
});

const userRole = ac.newRole({
  user: ["read:own", "update:own", "delete:own"],
});

export function createAuth() {
  const db = createDb();

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: schema,
    }),
    trustedOrigins: [env.CORS_ORIGIN],
    emailAndPassword: {
      enabled: true,
    },
    // uncomment cookieCache setting when ready to deploy to Cloudflare using *.workers.dev domains
    // session: {
    //   cookieCache: {
    //     enabled: true,
    //     maxAge: 60,
    //   },
    // },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      },
      // uncomment crossSubDomainCookies setting when ready to deploy and replace <your-workers-subdomain> with your actual workers subdomain
      // https://developers.cloudflare.com/workers/wrangler/configuration/#workersdev
      // crossSubDomainCookies: {
      //   enabled: true,
      //   domain: "<your-workers-subdomain>",
      // },
    },
    plugins: [
      admin({
        defaultRole: "user",
        adminRoles: ["admin"],
        ac,
        roles: {
          admin: adminRole,
          user: userRole,
        },
      }),
    ],
  });
}
