import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import SignInForm from "@/components/sign-in-form";
import SignUpForm from "@/components/sign-up-form";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Masuk — MULAI+ Career" },
      {
        name: "description",
        content: "Masuk ke akun MULAI+ Career untuk melanjutkan perjalanan kariermu.",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <AppShell>
      <div className="mx-auto mt-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="font-bricolage text-2xl font-extrabold tracking-tight text-brand-navy">
            MULAI<span className="text-brand-orange">+</span>{" "}
            <span className="font-manrope text-xs font-bold uppercase tracking-widest text-brand-orange">
              Career
            </span>
          </span>
          <h1 className="mt-3 font-bricolage text-2xl font-bold text-brand-navy">
            {showSignIn ? "Selamat datang kembali" : "Buat akun baru"}
          </h1>
          <p className="mt-2 font-manrope text-sm text-text-muted">
            {showSignIn
              ? "Lanjutkan audit CV, jalur karier, dan mentoring-mu."
              : "Gratis — lanjutkan perjalanan kariermu dalam 2 menit."}
          </p>
        </div>

        {showSignIn ? (
          <SignInForm onSwitchToSignUp={() => setShowSignIn(false)} />
        ) : (
          <SignUpForm onSwitchToSignIn={() => setShowSignIn(true)} />
        )}

        <p className="mt-6 text-center font-manrope text-xs text-text-muted">
          Dengan mendaftar, kamu menyetujui{" "}
          <a href="#" className="font-semibold text-brand-orange hover:underline">
            Syarat & Ketentuan
          </a>{" "}
          dan{" "}
          <a href="#" className="font-semibold text-brand-orange hover:underline">
            Kebijakan Privasi
          </a>
          .
        </p>
      </div>
    </AppShell>
  );
}
