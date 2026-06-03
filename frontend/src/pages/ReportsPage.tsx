import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "../components/MetricCard";
import { PageHeader } from "../components/PageHeader";
import { api } from "../lib/api";

type Report = {
  inventory: Record<string, number>;
  inspections: Record<string, number>;
  compliance: Record<string, number>;
  maintenance: { maintenanceFrequency: number };
};

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

export function ReportsPage() {
  const { data } = useQuery({ queryKey: ["reports"], queryFn: () => api<Report>("/reports") });

  async function download(path: string, filename: string) {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/reports/${path}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error("Export failed");
    const url = URL.createObjectURL(await response.blob());
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader title="Reports" description="Real-time operational and compliance reporting." />
      <div className="mb-6 flex gap-3">
        <button
          className="rounded-lg bg-fire px-4 py-2 text-sm font-semibold text-white"
          onClick={() => download("export.csv", "fire-extinguisher-report.csv")}
        >
          Export CSV
        </button>
        <button
          className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold"
          onClick={() => download("export.pdf", "fire-extinguisher-report.pdf")}
        >
          Export PDF
        </button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Inventory total" value={data?.inventory.total ?? "-"} context="All registered units" />
        <MetricCard label="Completed inspections" value={data?.inspections.completed ?? "-"} context="Inspection history" />
        <MetricCard label="Expired" value={data?.compliance.expired ?? "-"} context="Non-compliant units" />
        <MetricCard label="Maintenance records" value={data?.maintenance.maintenanceFrequency ?? "-"} context="All recorded activity" />
      </div>
    </>
  );
}
