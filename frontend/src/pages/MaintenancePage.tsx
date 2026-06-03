import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../auth/AuthContext";
import { DataTable } from "../components/DataTable";
import { ModalForm } from "../components/ModalForm";
import { PageHeader } from "../components/PageHeader";
import { api } from "../lib/api";
import type { Extinguisher, Maintenance } from "../lib/types";

/** Renders the maintenance log list and entry form for inspectors and admins. */
export function MaintenancePage() {
  const { user } = useAuth();
  const client = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ extinguisherId: "", actionTaken: "", issuesIdentified: "", recommendations: "", notes: "", maintenanceDate: "" });
  const { data = [] } = useQuery({ queryKey: ["maintenance"], queryFn: () => api<Maintenance[]>("/maintenance") });
  const { data: extinguishers = [] } = useQuery({ queryKey: ["extinguishers"], queryFn: () => api<Extinguisher[]>("/extinguishers") });
  /** Handles new maintenance record form submission. */
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try { await api("/maintenance", { method: "POST", body: JSON.stringify(form) }); toast.success("Maintenance logged"); setOpen(false); client.invalidateQueries({ queryKey: ["maintenance"] }); } catch (error) { toast.error((error as Error).message); }
  }
  const rows = data.map((item) => [item.extinguisher.serialNumber, item.extinguisher.location, item.actionTaken, item.issuesIdentified ?? "-", new Date(item.maintenanceDate).toLocaleDateString()]);
  const canLog = user?.role === "ADMIN" || user?.role === "INSPECTOR";
  return <><div className="flex items-start justify-between gap-4"><PageHeader title="Maintenance" description="Review service actions, issues, and recommendations." />{canLog && <button className="rounded-lg bg-fire px-4 py-2 text-sm font-semibold text-white" onClick={() => setOpen(true)}>Log maintenance</button>}</div><DataTable headers={["Extinguisher", "Location", "Action taken", "Issues", "Date"]} rows={rows} />{open && <ModalForm title="Log maintenance" onClose={() => setOpen(false)}><form className="grid gap-4" onSubmit={submit}><label className="text-sm font-medium">Extinguisher<select className="mt-1 w-full rounded-lg border px-3 py-2" required value={form.extinguisherId} onChange={(event) => setForm({ ...form, extinguisherId: event.target.value })}><option value="">Select equipment</option>{extinguishers.map((item) => <option key={item.id} value={item.id}>{item.serialNumber} - {item.location}</option>)}</select></label>{["actionTaken", "issuesIdentified", "recommendations", "notes"].map((name) => <label className="text-sm font-medium" key={name}>{name}<textarea className="mt-1 w-full rounded-lg border px-3 py-2" required={name === "actionTaken"} value={form[name as keyof typeof form]} onChange={(event) => setForm({ ...form, [name]: event.target.value })} /></label>)}<label className="text-sm font-medium">Date<input className="mt-1 w-full rounded-lg border px-3 py-2" required type="date" value={form.maintenanceDate} onChange={(event) => setForm({ ...form, maintenanceDate: event.target.value })} /></label><button className="rounded-lg bg-fire px-4 py-2 font-semibold text-white">Save</button></form></ModalForm>}</>;
}
