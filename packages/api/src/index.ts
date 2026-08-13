import { ORPCError, os } from "@orpc/server";

import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      session: context.session,
    },
  });
});

const requireAdmin = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  const role = context.session.user.role;
  if (role !== "admin") {
    throw new ORPCError("FORBIDDEN", {
      message: "Akses hanya untuk superadmin",
    });
  }
  return next({ context });
});

const requireManager = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  const role = context.session.user.role;
  if (role !== "admin" && role !== "manager") {
    throw new ORPCError("FORBIDDEN", {
      message: "Akses hanya untuk manager / superadmin",
    });
  }
  return next({ context });
});

export const protectedProcedure = publicProcedure.use(requireAuth);
export const adminProcedure = publicProcedure.use(requireAdmin);
export const managerProcedure = publicProcedure.use(requireManager);
