import { useQuery } from "@tanstack/react-query";
import { BarChart3, CalendarPlus, ClipboardCheck, Wrench } from "lucide-react";
import { MetricCard } from "../MetricCard";
import { QuickAction } from "./QuickAction";
import { api } from "../../lib/api";
import type { Extinguisher, Inspection, Maintenance } from "../../lib/types";

/** Renders the inspector dashboard with inspection metrics and workspace links. */
export function InspectorDashboard() {
  const inspections = useQuery({ queryKey: ["inspections"], queryFn: () => api<Inspection[]>("/inspections") }).data ?? [];
  const maintenance = useQuery({ queryKey: ["maintenance"], queryFn: () => api<Maintenance[]>("/maintenance") }).data ?? [];
  const equipment = useQuery({ queryKey: ["extinguishers"], queryFn: () => api<Extinguisher[]>("/extinguishers") }).data ?? [];
  return <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard label="Scheduled inspections" value={inspections.filter((item) => item.status === "SCHEDULED").length} context="Ready to conduct" /><MetricCard label="Overdue inspections" value={inspections.filter((item) => item.status === "OVERDUE").length} context="Needs priority" /><MetricCard label="Completed inspections" value={inspections.filter((item) => item.status === "COMPLETED").length} context="Results recorded" /><MetricCard label="Maintenance records" value={maintenance.length} context={`${equipment.length} extinguishers in inventory`} /></div><h2 className="mb-3 mt-8 text-lg font-bold text-nav">Inspector workspace</h2><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><QuickAction to="/inspections" title="Conduct inspections" description="Log results and complete scheduled work." icon={ClipboardCheck} /><QuickAction to="/inspections" title="Schedule inspection" description="Plan the next equipment inspection." icon={CalendarPlus} /><QuickAction to="/maintenance" title="Log maintenance" description="Record actions, issues, and recommendations." icon={Wrench} /><QuickAction to="/reports" title="View reports" description="Review compliance metrics and export data." icon={BarChart3} /></div></>;
}
