import { createDb } from "@karir-mulai-plus/db";
import * as schema from "@karir-mulai-plus/db/schema/auth";
import { env } from "@karir-mulai-plus/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, createAccessControl } from "better-auth/plugins";

/**
 * Access control MULAI+ Career:
 * - user      : akses default (login, data pribadi)
 * - manager   : kelola konten & konfig (market, mentor, blog, landing)
 * - superadmin: kelola user/role + semua akses manager
 */
const statement = {
  user: ["read:own", "update:own", "delete:own"],
  manager: ["read:any", "update:config", "manage:content"],
  admin: ["read:any", "update:any", "delete:any", "manage:users", "manage:data", "update:config", "manage:content"],
} as const;

const ac = createAccessControl(statement);

const adminRole = ac.newRole({
  user: ["read:own", "update:own", "delete:own"],
  admin: ["read:any", "update:any", "delete:any", "manage:users", "manage:data", "update:config", "manage:content"],
});

const managerRole = ac.newRole({
  user: ["read:own", "update:own", "delete:own"],
  manager: ["read:any", "update:config", "manage:content"],
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
          manager: managerRole,
          user: userRole,
        },
      }),
    ],
  });
}
