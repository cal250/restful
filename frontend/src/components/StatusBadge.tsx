const styles: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700",
  COMPLETED: "bg-emerald-100 text-emerald-700",
  SCHEDULED: "bg-blue-100 text-blue-700",
  EXPIRED: "bg-red-100 text-red-700",
  OVERDUE: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-100 text-slate-600",
  OUT_OF_SERVICE: "bg-amber-100 text-amber-700",
  UNDER_MAINTENANCE: "bg-amber-100 text-amber-700"
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status] ?? "bg-slate-100"}`}>{status.replaceAll("_", " ")}</span>;
}
