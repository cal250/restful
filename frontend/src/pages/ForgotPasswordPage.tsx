import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { AuthCard } from "../components/auth/AuthCard";
import { AuthLayout } from "../components/auth/AuthLayout";
import { FormField } from "../components/auth/FormField";
import { api } from "../lib/api";

const schema = z.object({ email: z.string().email() });
type FormData = z.infer<typeof schema>;

/** Renders the forgot-password request page. */
export function ForgotPasswordPage() {
  const [resetToken, setResetToken] = useState<string>();
  const { register, handleSubmit, formState: { errors, isSubmitting, isSubmitSuccessful } } = useForm<FormData>({ resolver: zodResolver(schema) });
  /** Handles password reset email request submission. */
  async function submit(data: FormData) {
    try {
      const result = await api<{ resetToken?: string }>("/auth/forgot-password", { method: "POST", body: JSON.stringify(data) });
      setResetToken(result?.resetToken); toast.success("Reset request submitted");
    } catch (error) { toast.error((error as Error).message); }
  }
  return <AuthLayout><AuthCard title="Reset your password" description="Enter your account email and we will create secure password reset instructions.">{isSubmitSuccessful ? <div className="mt-7 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-700">If an account exists for that email, reset instructions have been created.{resetToken && <Link className="mt-3 block font-semibold underline" to={`/reset-password?token=${resetToken}`}>Continue with local reset token</Link>}</div> : <form className="mt-7 space-y-5" onSubmit={handleSubmit(submit)}><FormField label="Email address" error={errors.email?.message}><span className="relative block"><Mail className="absolute left-3 top-5 text-slate-400" size={17} /><input className="mt-2 w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 outline-none focus:border-fire focus:ring-2 focus:ring-red-100" placeholder="you@company.com" {...register("email")} /></span></FormField><button className="w-full rounded-lg bg-fire px-4 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-60" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Send reset instructions"}</button></form>}<div className="mt-6 flex justify-between text-sm"><Link className="flex items-center gap-1 font-semibold text-fire hover:underline" to="/login"><ArrowLeft size={15} /> Back to sign in</Link><Link className="font-semibold text-slate-500 hover:text-fire" to="/reset-password">Have a reset token?</Link></div></AuthCard></AuthLayout>;
}
