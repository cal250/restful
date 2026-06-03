import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "../auth/AuthContext";
import { AuthCard } from "../components/auth/AuthCard";
import { AuthLayout } from "../components/auth/AuthLayout";
import { FormField } from "../components/auth/FormField";
import {
  clearPendingRegistration,
  readPendingRegistration,
  type PendingRegistration
} from "./RegisterPage";

const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit verification code")
});

type OtpForm = z.infer<typeof otpSchema>;

const inputClass =
  "w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 outline-none transition focus:border-fire focus:ring-2 focus:ring-red-100";
const iconClass = "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400";

/** Renders the OTP verification step required to finish registration. */
export function RegisterVerifyPage() {
  const { verifyRegistrationOtp, resendRegistrationOtp } = useAuth();
  const navigate = useNavigate();
  const [pending] = useState<PendingRegistration | null>(() => readPendingRegistration());
  const otpForm = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" }
  });

  if (!pending) {
    return <Navigate replace to="/register" />;
  }

  const pendingRegistration = pending;

  /** Verifies the OTP and completes account creation. */
  async function submitOtp(data: OtpForm) {
    try {
      await verifyRegistrationOtp({ email: pendingRegistration.email, otp: data.otp });
      clearPendingRegistration();
      toast.success("Account verified");
      navigate("/");
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  /** Requests a fresh verification code for the pending registration. */
  async function resendOtp() {
    try {
      await resendRegistrationOtp(pendingRegistration.email);
      otpForm.reset({ otp: "" });
      toast.success("Verification code resent");
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Verify your email"
        description={`Enter the 6-digit code for ${pendingRegistration.email}. Look it up in Prisma Studio under RegistrationOtp.`}
      >
        <form className="mt-7 space-y-4" onSubmit={otpForm.handleSubmit(submitOtp)}>
          <FormField label="Verification code" error={otpForm.formState.errors.otp?.message}>
            <span className="relative mt-2 block">
              <KeyRound className={iconClass} size={17} />
              <input
                autoComplete="one-time-code"
                autoFocus
                className={`${inputClass} tracking-[0.35em]`}
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                {...otpForm.register("otp")}
              />
            </span>
          </FormField>

          <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            The code is stored temporarily in the database and expires after 10 minutes.
          </p>

          <button
            className="w-full rounded-lg bg-fire px-4 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            disabled={otpForm.formState.isSubmitting}
            type="submit"
          >
            {otpForm.formState.isSubmitting ? "Verifying..." : "Verify and create account"}
          </button>

          <div className="flex items-center justify-between text-sm">
            <Link className="font-semibold text-fire hover:underline" to="/register">
              Back to registration
            </Link>
            <button className="font-semibold text-slate-500 hover:text-fire" onClick={resendOtp} type="button">
              Resend code
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Already verified?{" "}
          <Link className="font-semibold text-fire hover:underline" to="/login">
            Sign in
          </Link>
        </p>
      </AuthCard>
    </AuthLayout>
  );
}
