import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, LockKeyhole, Mail, Shield, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "../auth/AuthContext";
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

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 outline-none transition focus:border-fire focus:bg-white focus:ring-2 focus:ring-red-100";

const cardClass = "rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm";

/** Returns a human-readable label for a user role. */
function roleLabel(role: User["role"]) {
  return role === "ADMIN" ? "Administrator" : role === "INSPECTOR" ? "Inspector" : "User";
}

/** Builds initials from the user's first and last name. */
function initials(firstName?: string, lastName?: string) {
  return `${firstName?.charAt(0) ?? ""}${lastName?.charAt(0) ?? ""}`.toUpperCase() || "U";
}

/** Renders the user profile page for account, password, and recovery settings. */
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

  /** Handles profile name updates and syncs the auth session. */
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

  /** Handles password change when the current password is known. */
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

  /** Handles password recovery request for the signed-in user's email. */
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

  const displayName = data ? `${data.firstName} ${data.lastName}` : `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();

  return (
    <div className="-m-6 flex min-h-full flex-col">
      <section className="relative overflow-hidden bg-nav px-6 pb-16 pt-8 text-white md:px-10 md:pb-20 md:pt-10">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-fire/20 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-red-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex items-center gap-5">
            <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-fire text-2xl font-bold shadow-lg shadow-red-900/30 md:h-24 md:w-24 md:text-3xl">
              {initials(data?.firstName ?? user?.firstName, data?.lastName ?? user?.lastName)}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-red-300">My account</p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">{displayName || "Profile"}</h1>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-300">
                <Mail size={16} />
                {data?.email ?? user?.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm backdrop-blur">
              <Shield size={16} className="text-red-300" />
              {data ? roleLabel(data.role) : roleLabel(user!.role)}
            </span>
            <span className="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-slate-200 backdrop-blur">
              Account settings & security
            </span>
          </div>
        </div>
      </section>

      <div className="relative -mt-10 flex-1 px-4 pb-8 md:px-8">
        <div className="grid gap-6 xl:grid-cols-12">
          <section className={`${cardClass} xl:col-span-7`}>
            <div className="mb-6 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-fire">
                <UserRound size={22} />
              </span>
              <div>
                <h2 className="text-lg font-bold text-nav">Account details</h2>
                <p className="text-sm text-slate-500">Update the name shown across dashboards and records.</p>
              </div>
            </div>

            {isLoading ? (
              <p className="text-sm text-slate-500">Loading profile...</p>
            ) : (
              <form className="space-y-6" onSubmit={profileForm.handleSubmit(submitProfile)}>
                <div className="grid gap-5 md:grid-cols-2">
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

                <div className="grid gap-4 rounded-xl bg-slate-50 p-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Email address</p>
                    <p className="mt-2 flex items-center gap-2 font-medium text-slate-700">
                      <Mail size={16} className="text-slate-400" />
                      {data?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">System role</p>
                    <p className="mt-2 font-medium text-slate-700">{data ? roleLabel(data.role) : "-"}</p>
                  </div>
                </div>

                <button
                  className="rounded-xl bg-fire px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
                  disabled={profileForm.formState.isSubmitting}
                  type="submit"
                >
                  {profileForm.formState.isSubmitting ? "Saving..." : "Save profile changes"}
                </button>
              </form>
            )}
          </section>

          <aside className="grid gap-4 xl:col-span-5">
            <div className={`${cardClass} bg-gradient-to-br from-white to-red-50/40`}>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Signed in as</p>
              <p className="mt-2 text-xl font-bold text-nav">{displayName}</p>
              <p className="mt-1 text-sm text-slate-500">{data?.email ?? user?.email}</p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl border bg-white/80 p-3">
                  <p className="text-xs text-slate-400">Role</p>
                  <p className="mt-1 text-sm font-semibold text-nav">{data ? roleLabel(data.role) : "-"}</p>
                </div>
                <div className="rounded-xl border bg-white/80 p-3">
                  <p className="text-xs text-slate-400">Access</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-600">Active</p>
                </div>
              </div>
            </div>

            <div className={`${cardClass} border-dashed`}>
              <p className="text-sm leading-relaxed text-slate-500">
                Keep your profile up to date so inspection records, maintenance logs, and notifications show the
                correct responsible person across the fire safety system.
              </p>
            </div>
          </aside>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className={cardClass}>
            <div className="mb-6 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-fire">
                <LockKeyhole size={22} />
              </span>
              <div>
                <h2 className="text-lg font-bold text-nav">Change password</h2>
                <p className="text-sm text-slate-500">Use this when you know your current password.</p>
              </div>
            </div>

            <form className="space-y-5" onSubmit={passwordForm.handleSubmit(submitPassword)}>
              <label className="block text-sm font-medium text-slate-700">
                Current password
                <input className={inputClass} type="password" {...passwordForm.register("currentPassword")} />
                {passwordForm.formState.errors.currentPassword && (
                  <span className="mt-1 block text-xs text-red-600">
                    {passwordForm.formState.errors.currentPassword.message}
                  </span>
                )}
              </label>
              <div className="grid gap-5 md:grid-cols-2">
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
              <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed text-slate-500">
                Password must be at least 8 characters and include uppercase, lowercase, and a number.
              </p>
              <button
                className="rounded-xl bg-fire px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                disabled={passwordForm.formState.isSubmitting}
                type="submit"
              >
                {passwordForm.formState.isSubmitting ? "Updating..." : "Change password"}
              </button>
            </form>
          </section>

          <section className={cardClass}>
            <div className="mb-6 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-fire">
                <KeyRound size={22} />
              </span>
              <div>
                <h2 className="text-lg font-bold text-nav">Password recovery</h2>
                <p className="text-sm text-slate-500">Request a reset if you cannot remember your current password.</p>
              </div>
            </div>

            <div className="space-y-5">
              <p className="text-sm leading-relaxed text-slate-600">
                A recovery request will be created for{" "}
                <span className="font-semibold text-nav">{user?.email}</span>. In production this would be emailed to
                you. Use the reset page to set a new password with your token.
              </p>

              {recoverySent ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-700">
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
                  className="rounded-xl border border-fire bg-white px-5 py-3 text-sm font-semibold text-fire transition hover:bg-red-50"
                  onClick={requestPasswordRecovery}
                  type="button"
                >
                  Send password recovery request
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
