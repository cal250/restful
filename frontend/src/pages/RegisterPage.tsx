import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "../auth/AuthContext";
import { AuthCard } from "../components/auth/AuthCard";
import { AuthLayout } from "../components/auth/AuthLayout";
import { FormField } from "../components/auth/FormField";

const registerSchema = z.object({
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(8).max(72).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/)
});

type RegisterForm = z.infer<typeof registerSchema>;

const inputClass =
  "w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 outline-none transition focus:border-fire focus:ring-2 focus:ring-red-100";
const iconClass = "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400";

export const PENDING_REGISTRATION_KEY = "tzw.pendingRegistration";

export type PendingRegistration = {
  email: string;
};

/** Saves pending registration details between the register and verify steps. */
export function savePendingRegistration(data: PendingRegistration) {
  sessionStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify(data));
}

/** Reads pending registration details for the OTP verification step. */
export function readPendingRegistration(): PendingRegistration | null {
  const raw = sessionStorage.getItem(PENDING_REGISTRATION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingRegistration;
  } catch {
    return null;
  }
}

/** Clears pending registration details after successful verification. */
export function clearPendingRegistration() {
  sessionStorage.removeItem(PENDING_REGISTRATION_KEY);
}

/** Renders the first step of registration before OTP verification. */
export function RegisterPage() {
  const { startRegistration } = useAuth();
  const navigate = useNavigate();
  const registerForm = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  /** Sends registration details and moves to the OTP verification page. */
  async function submitRegistration(data: RegisterForm) {
    try {
      const result = await startRegistration(data);
      savePendingRegistration({ email: result.email });
      toast.success("Verification code sent to your email");
      navigate("/register/verify");
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Create your account"
        description="Register as a standard user. An administrator can later assign inspector access when appropriate."
      >
        <form className="mt-7 space-y-4" onSubmit={registerForm.handleSubmit(submitRegistration)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="First name" error={registerForm.formState.errors.firstName?.message}>
              <span className="relative mt-2 block">
                <UserRound className={iconClass} size={17} />
                <input className={inputClass} {...registerForm.register("firstName")} />
              </span>
            </FormField>
            <FormField label="Last name" error={registerForm.formState.errors.lastName?.message}>
              <span className="relative mt-2 block">
                <UserRound className={iconClass} size={17} />
                <input className={inputClass} {...registerForm.register("lastName")} />
              </span>
            </FormField>
          </div>

          <FormField label="Email address" error={registerForm.formState.errors.email?.message}>
            <span className="relative mt-2 block">
              <Mail className={iconClass} size={17} />
              <input className={inputClass} placeholder="you@company.com" {...registerForm.register("email")} />
            </span>
          </FormField>

          <FormField label="Password" error={registerForm.formState.errors.password?.message}>
            <span className="relative mt-2 block">
              <LockKeyhole className={iconClass} size={17} />
              <input className={inputClass} type="password" {...registerForm.register("password")} />
            </span>
          </FormField>

          <p className="text-xs leading-relaxed text-slate-400">
            Use 8-72 characters with uppercase, lowercase, and a number. A 6-digit verification code will be stored temporarily for your email.
          </p>

          <button
            className="w-full rounded-lg bg-fire px-4 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            disabled={registerForm.formState.isSubmitting}
            type="submit"
          >
            {registerForm.formState.isSubmitting ? "Sending code..." : "Continue to verification"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link className="font-semibold text-fire hover:underline" to="/login">
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
