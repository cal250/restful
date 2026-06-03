import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "../auth/AuthContext";
import { AuthCard } from "../components/auth/AuthCard";
import { AuthLayout } from "../components/auth/AuthLayout";
import { FormField } from "../components/auth/FormField";

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
type FormData = z.infer<typeof schema>;
const inputClass =
  "w-full rounded-lg border border-slate-200 py-2.5 pl-10 outline-none transition focus:border-fire focus:ring-2 focus:ring-red-100";
const iconClass = "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400";
const toggleClass =
  "absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center p-1 text-slate-400 hover:text-slate-600";

/** Renders the sign-in page with email and password authentication. */
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  /** Handles sign-in form submission and redirects on success. */
  async function submit(data: FormData) {
    try {
      await login(data.email, data.password);
      navigate("/");
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        description="Sign in to continue managing your organization's fire safety operations."
      >
        <form className="mt-7 space-y-4" onSubmit={handleSubmit(submit)}>
          <FormField label="Email address" error={errors.email?.message}>
            <span className="relative mt-2 block">
              <Mail className={iconClass} size={17} />
              <input className={`${inputClass} pr-3`} placeholder="you@company.com" {...register("email")} />
            </span>
          </FormField>

          <FormField label="Password" error={errors.password?.message}>
            <span className="relative mt-2 block">
              <LockKeyhole className={iconClass} size={17} />
              <input
                className={`${inputClass} pr-10`}
                placeholder="Enter your password"
                type={show ? "text" : "password"}
                {...register("password")}
              />
              <button className={toggleClass} type="button" onClick={() => setShow(!show)}>
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </span>
          </FormField>

          <div className="flex justify-end">
            <Link className="text-sm font-semibold text-fire hover:underline" to="/forgot-password">
              Forgot password?
            </Link>
          </div>

          <button
            className="w-full rounded-lg bg-fire px-4 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          New to TZW Fire Safety?{" "}
          <Link className="font-semibold text-fire hover:underline" to="/register">
            Create an account
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
