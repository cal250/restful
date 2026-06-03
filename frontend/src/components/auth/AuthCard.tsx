import { Flame } from "lucide-react";

/** Renders a branded card wrapper for authentication forms. */
export function AuthCard({ title, description, children }: {
  title: string; description: string; children: React.ReactNode;
}) {
  return <div className="w-full max-w-md"><div className="mb-8 flex items-center gap-3 lg:hidden"><span className="grid h-10 w-10 place-items-center rounded-xl bg-fire text-white"><Flame size={22} /></span><div><p className="font-bold text-nav">TZW LTD</p><p className="text-xs text-slate-500">Fire Safety Management</p></div></div><div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60 sm:p-9"><h2 className="text-3xl font-bold text-nav">{title}</h2><p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>{children}</div><p className="mt-6 text-center text-xs text-slate-400">Protected by secure authentication and role-based authorization.</p></div>;
}
