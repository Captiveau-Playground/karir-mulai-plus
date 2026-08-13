import { Button } from "@karir-mulai-plus/ui/components/button";
import { Input } from "@karir-mulai-plus/ui/components/input";
import { Label } from "@karir-mulai-plus/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

export default function SignInForm({ onSwitchToSignUp }: { onSwitchToSignUp: () => void }) {
  const navigate = useNavigate({
    from: "/login",
  });
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/dashboard",
            });
            toast.success("Berhasil masuk! 🎉");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText || "Gagal masuk");
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        email: z.email("Email tidak valid"),
        password: z.string().min(8, "Password minimal 8 karakter"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-5"
      >
        <div>
          <form.Field name="email">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="font-manrope text-sm font-semibold text-brand-navy">
                  Email
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  placeholder="nama@email.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="font-manrope text-xs text-brand-red">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <div>
          <form.Field name="password">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="font-manrope text-sm font-semibold text-brand-navy">
                  Password
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  type="password"
                  placeholder="••••••••"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
                {field.state.meta.errors.map((error) => (
                  <p key={error?.message} className="font-manrope text-xs text-brand-red">
                    {error?.message}
                  </p>
                ))}
              </div>
            )}
          </form.Field>
        </div>

        <form.Subscribe
          selector={(state) => ({ canSubmit: state.canSubmit, isSubmitting: state.isSubmitting })}
        >
          {({ canSubmit, isSubmitting }) => (
            <Button
              type="submit"
              className="h-11 w-full rounded-full bg-brand font-manrope font-bold text-brand-foreground shadow-lg shadow-brand/25 transition-all duration-300 hover:bg-brand/90"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "Memproses..." : "Masuk"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-5 text-center">
        <Button
          variant="link"
          onClick={onSwitchToSignUp}
          className="font-manrope text-sm font-semibold text-brand-orange hover:text-brand-orange/80"
        >
          Belum punya akun? Daftar gratis
        </Button>
      </div>
    </div>
  );
}
