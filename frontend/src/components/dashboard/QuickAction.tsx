import { Link } from "react-router-dom";

/** Renders a navigable quick-action card with icon, title, and description. */
export function QuickAction({ to, title, description, icon: Icon }: {
  to: string; title: string; description: string; icon: React.ComponentType<{ size?: number }>;
}) {
  return <Link className="group rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-red-200 hover:shadow-md" to={to}><span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-fire"><Icon size={20} /></span><p className="mt-4 font-semibold text-nav group-hover:text-fire">{title}</p><p className="mt-1 text-sm leading-relaxed text-slate-500">{description}</p></Link>;
}
