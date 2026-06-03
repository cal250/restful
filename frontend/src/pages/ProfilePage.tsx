import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "../auth/AuthContext";
import { PageHeader } from "../components/PageHeader";
import { api } from "../lib/api";
import type { User } from "../lib/types";

const profileSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(50),
  lastName: z.string().trim().min(1, "Last name is required").max(50)
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8).max(72)
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[a-z]/, "Include a lowercase letter")
    .regex(/[0-9]/, "Include a number"),
  confirmPassword: z.string().min(1, "Confirm your new password")
}).refine((value) => value.newPassword === value.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
}).refine((value) => value.currentPassword !== value.newPassword, {
  message: "New password must be different from your current password",
  path: ["newPassword"]
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

const inputClass = "mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none focus:border-fire focus:ring-2 focus:ring-red-100";

function roleLabel(role: User["role"]) {
  return role === "ADMIN" ? "Administrator" : role === "INSPECTOR" ? "Inspector" : "User";
}

export function ProfilePage() {
  const { user, syncUser } = useAuth();
  const client = useQueryClient();
  const [resetToken, setResetToken] = useState<string>();
  const [recoverySent, setRecoverySent] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: () => api<User>("/users/profile")
  });

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: "", lastName: "" }
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" }
  });

  useEffect(() => {
    if (!data) return;
    profileForm.reset({ firstName: data.firstName, lastName: data.lastName });
  }, [data, profileForm]);

  async function submitProfile(values: ProfileForm) {
    try {
      const updated = await api<User>("/users/profile", {
        method: "PATCH",
        body: JSON.stringify(values)
      });
      syncUser(updated);
      client.setQueryData(["profile"], updated);
      toast.success("Profile updated");
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  async function submitPassword(values: PasswordForm) {
    try {
      await api("/users/profile/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword
        })
      });
      passwordForm.reset();
      toast.success("Password changed");
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  async function requestPasswordRecovery() {
    if (!user?.email) return;
    try {
      const result = await api<{ resetToken?: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: user.email })
      });
      setResetToken(result?.resetToken);
      setRecoverySent(true);
      toast.success("Password recovery instructions created");
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  return (
    <>
      <PageHeader
        title="Profile"
        description="Manage your account details, password, and recovery options."
      />

      <div className="grid max-w-4xl gap-6">
        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b pb-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-fire">
              <UserRound size={20} />
            </span>
            <div>
              <h2 className="font-semibold text-nav">Account details</h2>
              <p className="text-sm text-slate-500">Update your name shown across the system.</p>
            </div>
          </div>

          {isLoading ? (
            <p className="mt-6 text-sm text-slate-500">Loading profile...</p>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={profileForm.handleSubmit(submitProfile)}>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-medium text-slate-700">
                  First name
                  <input className={inputClass} {...profileForm.register("firstName")} />
                  {profileForm.formState.errors.firstName && (
                    <span className="mt-1 block text-xs text-red-600">
                      {profileForm.formState.errors.firstName.message}
                    </span>
                  )}
                </label>
                <label className="text-sm font-medium text-slate-700">
                  Last name
                  <input className={inputClass} {...profileForm.register("lastName")} />
                  {profileForm.formState.errors.lastName && (
                    <span className="mt-1 block text-xs text-red-600">
                      {profileForm.formState.errors.lastName.message}
                    </span>
                  )}
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-slate-400">Email</p>
                  <p className="mt-1 flex items-center gap-2 font-medium text-slate-700">
                    <Mail size={16} className="text-slate-400" />
                    {data?.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase text-slate-400">Role</p>
                  <p className="mt-1 font-medium text-slate-700">{data ? roleLabel(data.role) : "-"}</p>
                </div>
              </div>

              <button
                className="rounded-lg bg-fire px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                disabled={profileForm.formState.isSubmitting}
                type="submit"
              >
                {profileForm.formState.isSubmitting ? "Saving..." : "Save profile"}
              </button>
            </form>
          )}
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b pb-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-fire">
              <LockKeyhole size={20} />
            </span>
            <div>
              <h2 className="font-semibold text-nav">Change password</h2>
              <p className="text-sm text-slate-500">Use this when you know your current password.</p>
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={passwordForm.handleSubmit(submitPassword)}>
            <label className="block text-sm font-medium text-slate-700">
              Current password
              <input className={inputClass} type="password" {...passwordForm.register("currentPassword")} />
              {passwordForm.formState.errors.currentPassword && (
                <span className="mt-1 block text-xs text-red-600">
                  {passwordForm.formState.errors.currentPassword.message}
                </span>
              )}
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                New password
                <input className={inputClass} type="password" {...passwordForm.register("newPassword")} />
                {passwordForm.formState.errors.newPassword && (
                  <span className="mt-1 block text-xs text-red-600">
                    {passwordForm.formState.errors.newPassword.message}
                  </span>
                )}
              </label>
              <label className="block text-sm font-medium text-slate-700">
                Confirm new password
                <input className={inputClass} type="password" {...passwordForm.register("confirmPassword")} />
                {passwordForm.formState.errors.confirmPassword && (
                  <span className="mt-1 block text-xs text-red-600">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </span>
                )}
              </label>
            </div>
            <p className="text-xs text-slate-500">
              Password must be at least 8 characters and include uppercase, lowercase, and a number.
            </p>
            <button
              className="rounded-lg bg-fire px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              disabled={passwordForm.formState.isSubmitting}
              type="submit"
            >
              {passwordForm.formState.isSubmitting ? "Updating..." : "Change password"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b pb-4">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-fire">
              <KeyRound size={20} />
            </span>
            <div>
              <h2 className="font-semibold text-nav">Password recovery</h2>
              <p className="text-sm text-slate-500">
                Request a reset link if you cannot remember your current password.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <p className="text-sm text-slate-600">
              A recovery request will be created for <span className="font-semibold">{user?.email}</span>.
              In production this would be emailed to you. Use the reset page to set a new password with your token.
            </p>

            {recoverySent ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                Recovery instructions have been created for your account.
                {resetToken && (
                  <Link className="mt-3 block font-semibold underline" to={`/reset-password?token=${resetToken}`}>
                    Continue with local reset token
                  </Link>
                )}
                <Link className="mt-3 block font-semibold text-emerald-800 underline" to="/reset-password">
                  Open reset password page
                </Link>
              </div>
            ) : (
              <button
                className="rounded-lg border border-fire px-4 py-2.5 text-sm font-semibold text-fire hover:bg-red-50"
                onClick={requestPasswordRecovery}
                type="button"
              >
                Send password recovery request
              </button>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
