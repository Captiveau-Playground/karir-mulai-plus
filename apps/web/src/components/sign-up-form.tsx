import { Button } from "@karir-mulai-plus/ui/components/button";
import { Input } from "@karir-mulai-plus/ui/components/input";
import { Label } from "@karir-mulai-plus/ui/components/label";
import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import z from "zod";

import { authClient } from "@/lib/auth-client";

import Loader from "./loader";

export default function SignUpForm({ onSwitchToSignIn }: { onSwitchToSignIn: () => void }) {
  const navigate = useNavigate({
    from: "/login",
  });
  const { isPending } = authClient.useSession();

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
      name: "",
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          email: value.email,
          password: value.password,
          name: value.name,
        },
        {
          onSuccess: () => {
            navigate({
              to: "/dashboard",
            });
            toast.success("Akun berhasil dibuat! 🎉");
          },
          onError: (error) => {
            toast.error(error.error.message || error.error.statusText || "Gagal daftar");
          },
        },
      );
    },
    validators: {
      onSubmit: z.object({
        name: z.string().min(2, "Nama minimal 2 karakter"),
        email: z.email("Email tidak valid"),
        password: z.string().min(8, "Password minimal 8 karakter"),
      }),
    },
  });

  if (isPending) {
    return <Loader />;
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm md:p-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-5"
      >
        <div>
          <form.Field name="name">
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="font-manrope text-sm font-semibold text-brand-navy">
                  Nama lengkap
                </Label>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder="Nama kamu"
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
                  placeholder="Minimal 8 karakter"
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
              className="h-11 w-full rounded-full bg-brand-navy font-manrope font-bold text-white shadow-lg shadow-brand-navy/25 transition-all duration-300 hover:bg-brand-navy-light"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "Memproses..." : "Daftar Gratis"}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <div className="mt-5 text-center">
        <Button
          variant="link"
          onClick={onSwitchToSignIn}
          className="font-manrope text-sm font-semibold text-brand-orange hover:text-brand-orange/80"
        >
          Sudah punya akun? Masuk
        </Button>
      </div>
    </div>
  );
}
