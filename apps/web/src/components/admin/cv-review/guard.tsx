import { Link } from "@tanstack/react-router";
import { Loader2, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

/**
 * Gerbang akses panel ops CV Review — hanya admin & manager MULAI+ Career.
 * Mengikuti pola guard di routes/admin.tsx supaya perilakunya konsisten.
 */
export function CvReviewGuard({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const isManager = session?.user?.role === "admin" || session?.user?.role === "manager";

  if (isPending) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-brand-navy" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <ShieldCheck className="mx-auto size-10 text-brand-orange" />
        <h1 className="mt-4 font-bricolage text-2xl font-bold text-brand-navy">Perlu masuk dulu</h1>
        <p className="mt-2 font-manrope text-sm text-text-muted">
          Login untuk mengakses panel ops review CV.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3 font-manrope text-sm font-bold text-white"
        >
          Masuk
        </Link>
      </div>
    );
  }

  if (!isManager) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <ShieldCheck className="mx-auto size-10 text-brand-red" />
        <h1 className="mt-4 font-bricolage text-2xl font-bold text-brand-navy">Akses ditolak</h1>
        <p className="mt-2 font-manrope text-sm text-text-muted">
          Panel ini khusus reviewer, writer, QA, dan manager MULAI+ Career.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}