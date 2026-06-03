import { zodResolver } from "@hookform/resolvers/zod";
import { KeyRound, LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { AuthCard } from "../components/auth/AuthCard";
import { AuthLayout } from "../components/auth/AuthLayout";
import { FormField } from "../components/auth/FormField";
import { api } from "../lib/api";

const schema = z.object({
  token: z.string().min(32, "Reset token is required"),
  password: z.string().min(8).max(72)
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[a-z]/, "Include a lowercase letter")
    .regex(/[0-9]/, "Include a number"),
  confirmPassword: z.string().min(1, "Confirm your new password")
}).refine((value) => value.password === value.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
type FormData = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema), defaultValues: { token: params.get("token") ?? "" }
  });
  async function submit(data: FormData) {
    try {
      await api("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token: data.token, password: data.password })
      });
      toast.success("Password reset successful");
      navigate("/login");
    } catch (error) {
      toast.error((error as Error).message);
    }
  }
  return <AuthLayout><AuthCard title="Choose a new password" description="Enter your secure reset token and a new password for your account."><form className="mt-7 space-y-4" onSubmit={handleSubmit(submit)}><FormField label="Reset token" error={errors.token?.message}><span className="relative block"><KeyRound className="absolute left-3 top-5 text-slate-400" size={17} /><input className="mt-2 w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 outline-none focus:border-fire focus:ring-2 focus:ring-red-100" {...register("token")} /></span></FormField><FormField label="New password" error={errors.password?.message}><span className="relative block"><LockKeyhole className="absolute left-3 top-5 text-slate-400" size={17} /><input className="mt-2 w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 outline-none focus:border-fire focus:ring-2 focus:ring-red-100" type="password" {...register("password")} /></span></FormField><FormField label="Confirm new password" error={errors.confirmPassword?.message}><span className="relative block"><LockKeyhole className="absolute left-3 top-5 text-slate-400" size={17} /><input className="mt-2 w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 outline-none focus:border-fire focus:ring-2 focus:ring-red-100" type="password" {...register("confirmPassword")} /></span></FormField><button className="w-full rounded-lg bg-fire px-4 py-2.5 font-semibold text-white hover:bg-red-700 disabled:opacity-60" disabled={isSubmitting}>{isSubmitting ? "Resetting..." : "Reset password"}</button></form><p className="mt-6 text-center text-sm text-slate-500">Remembered your password? <Link className="font-semibold text-fire hover:underline" to="/login">Sign in</Link></p></AuthCard></AuthLayout>;
}
