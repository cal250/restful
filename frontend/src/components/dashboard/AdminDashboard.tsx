import { useQuery } from "@tanstack/react-query";
import { BarChart3, ClipboardCheck, ShieldAlert, Users } from "lucide-react";
import { MetricCard } from "../MetricCard";
import { QuickAction } from "./QuickAction";
import { api } from "../../lib/api";

type Report = { inventory: { total: number }; inspections: { pending: number }; compliance: { expired: number; complianceRate: number } };

export function AdminDashboard() {
  const { data } = useQuery({ queryKey: ["reports"], queryFn: () => api<Report>("/reports") });
  return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Total extinguishers" value={data?.inventory.total ?? "-"} context="System inventory" /><MetricCard label="Pending inspections" value={data?.inspections.pending ?? "-"} context="Scheduled work" /><MetricCard label="Expired extinguishers" value={data?.compliance.expired ?? "-"} context="Requires attention" /><MetricCard label="Compliance rate" value={data ? `${data.compliance.complianceRate}%` : "-"} context="Data integrity overview" /></div><h2 className="mb-3 mt-8 text-lg font-bold text-nav">System management</h2><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><QuickAction to="/users" title="Manage users" description="Control roles, account status, and access." icon={Users} /><QuickAction to="/extinguishers" title="Manage inventory" description="Register equipment and maintain accurate records." icon={ShieldAlert} /><QuickAction to="/inspections" title="Review inspections" description="Monitor scheduled and completed inspection work." icon={ClipboardCheck} /><QuickAction to="/reports" title="View reports" description="Analyze compliance and export operational data." icon={BarChart3} /></div></>;
}
