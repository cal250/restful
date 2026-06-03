import { useQuery } from "@tanstack/react-query";
import { BarChart3, CalendarPlus, ShieldCheck } from "lucide-react";
import { MetricCard } from "../MetricCard";
import { QuickAction } from "./QuickAction";
import { api } from "../../lib/api";
import type { Extinguisher, Inspection } from "../../lib/types";

export function UserDashboard() {
  const equipment = useQuery({ queryKey: ["extinguishers"], queryFn: () => api<Extinguisher[]>("/extinguishers") }).data ?? [];
  const inspections = useQuery({ queryKey: ["inspections"], queryFn: () => api<Inspection[]>("/inspections") }).data ?? [];
  return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><MetricCard label="Extinguishers visible" value={equipment.length} context="Current equipment status" /><MetricCard label="Scheduled inspections" value={inspections.filter((item) => item.status === "SCHEDULED").length} context="Upcoming inspections" /><MetricCard label="Completed inspections" value={inspections.filter((item) => item.status === "COMPLETED").length} context="Inspection history" /></div><h2 className="mb-3 mt-8 text-lg font-bold text-nav">Your safety access</h2><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><QuickAction to="/extinguishers" title="View extinguisher status" description="Review equipment location, type, and expiry." icon={ShieldCheck} /><QuickAction to="/inspections" title="Schedule inspection" description="Request an inspection for available equipment." icon={CalendarPlus} /><QuickAction to="/reports" title="View reports" description="Review compliance metrics and export data." icon={BarChart3} /></div></>;
}
