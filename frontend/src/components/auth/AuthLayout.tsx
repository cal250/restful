import { BellRing, CheckCircle2, ClipboardCheck, Flame, ShieldCheck } from "lucide-react";

const benefits = [
  [ShieldCheck, "Compliance visibility", "See risks before they become audit findings."],
  [ClipboardCheck, "Inspection control", "Schedule and track work from one reliable system."],
  [BellRing, "Timely notifications", "Keep teams informed about important safety activity."]
] as const;

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2"><section className="relative hidden overflow-hidden bg-nav p-12 text-white lg:flex lg:flex-col lg:justify-between"><div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-fire/30 blur-3xl" /><div className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-red-400/10 blur-3xl" /><div className="relative"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-fire"><Flame size={24} /></span><div><p className="font-bold">TZW LTD</p><p className="text-xs text-slate-300">Fire Safety Management</p></div></div><div className="mt-20 max-w-lg"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-300">Safer workplaces, clearer records</p><h1 className="mt-5 text-5xl font-bold leading-tight">Every extinguisher. Every inspection. Always accounted for.</h1><p className="mt-6 text-lg leading-relaxed text-slate-300">A professional control center for equipment, maintenance, compliance, and reporting.</p></div></div><div className="relative space-y-5">{benefits.map(([Icon, title, text]) => <div className="flex gap-4" key={title}><span className="mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white/10"><Icon size={18} /></span><div><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-slate-400">{text}</p></div></div>)}<div className="flex items-center gap-2 pt-5 text-sm text-slate-400"><CheckCircle2 size={16} className="text-emerald-400" /> Secure role-based access for every team member</div></div></section><section className="flex min-h-screen items-center justify-center p-6 sm:p-10">{children}</section></main>;
}
