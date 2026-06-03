import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "../auth/AuthContext";
import { AuthCard } from "../components/auth/AuthCard";
import { AuthLayout } from "../components/auth/AuthLayout";
import { FormField } from "../components/auth/FormField";

const schema = z.object({
  firstName: z.string().trim().min(1).max(50), lastName: z.string().trim().min(1).max(50),
  email: z.string().email(), password: z.string().min(8).max(72).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/)
});
type FormData = z.infer<typeof schema>;
const inputClass = "mt-2 w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 outline-none transition focus:border-fire focus:ring-2 focus:ring-red-100";

/** Renders the account registration page for new users. */
export function RegisterPage() {
  const { registerAccount } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });
  /** Handles registration form submission and signs the user in. */
  async function submit(data: FormData) {
    try { await registerAccount(data); toast.success("Account created"); navigate("/"); } catch (error) { toast.error((error as Error).message); }
  }
  return <AuthLayout><AuthCard title="Create your account" description="Register as a standard user. An administrator can later assign inspector access when appropriate."><form className="mt-7 space-y-4" onSubmit={handleSubmit(submit)}><div className="grid gap-4 sm:grid-cols-2"><FormField label="First name" error={errors.firstName?.message}><span className="relative block"><UserRound className="absolute left-3 top-5 text-slate-400" size={17} /><input className={inputClass} {...register("firstName")} /></span></FormField><FormField label="Last name" error={errors.lastName?.message}><span className="relative block"><UserRound className="absolute left-3 top-5 text-slate-400" size={17} /><input className={inputClass} {...register("lastName")} /></span></FormField></div><FormField label="Email address" error={errors.email?.message}><span className="relative block"><Mail className="absolute left-3 top-5 text-slate-400" size={17} /><input className={inputClass} placeholder="you@company.com" {...register("email")} /></span></FormField><FormField label="Password" error={errors.password?.message}><span className="relative block"><LockKeyhole className="absolute left-3 top-5 text-slate-400" size={17} /><input className={inputClass} type="password" {...register("password")} /></span></FormField><p className="text-xs leading-relaxed text-slate-400">Use 8-72 characters with uppercase, lowercase, and a number.</p><button className="w-full rounded-lg bg-fire px-4 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-60" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Create account"}</button></form><p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link className="font-semibold text-fire hover:underline" to="/login">Sign in</Link></p></AuthCard></AuthLayout>;
}
