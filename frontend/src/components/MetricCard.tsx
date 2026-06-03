/** Renders a summary metric card with label, value, and context text. */
export function MetricCard({ label, value, context }: { label: string; value: number | string; context: string }) {
  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold text-nav">{value}</p><p className="mt-2 text-xs text-slate-400">{context}</p></article>;
}
