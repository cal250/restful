import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../auth/AuthContext";
import { DataTable } from "../components/DataTable";
import { ModalForm } from "../components/ModalForm";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { api } from "../lib/api";
import type { Extinguisher, Inspection } from "../lib/types";

export function InspectionsPage() {
  const client = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Inspection | null>(null);
  const [form, setForm] = useState({ extinguisherId: "", inspectionDate: "", inspectionTime: "" });
  const [result, setResult] = useState({ status: "COMPLETED", result: "", notes: "" });
  const { data = [] } = useQuery({ queryKey: ["inspections"], queryFn: () => api<Inspection[]>("/inspections") });
  const { data: extinguishers = [] } = useQuery({ queryKey: ["extinguishers"], queryFn: () => api<Extinguisher[]>("/extinguishers") });
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    try { await api("/inspections", { method: "POST", body: JSON.stringify(form) }); toast.success("Inspection scheduled"); setOpen(false); client.invalidateQueries({ queryKey: ["inspections"] }); } catch (error) { toast.error((error as Error).message); }
  }
  async function saveResult(event: React.FormEvent) {
    event.preventDefault();
    try { await api(`/inspections/${selected!.id}`, { method: "PATCH", body: JSON.stringify(result) }); toast.success("Inspection result saved"); setSelected(null); client.invalidateQueries({ queryKey: ["inspections"] }); } catch (error) { toast.error((error as Error).message); }
  }
  const canComplete = user?.role === "ADMIN" || user?.role === "INSPECTOR";
  const rows = data.map((item) => [item.extinguisher.serialNumber, item.extinguisher.location, new Date(item.inspectionDate).toLocaleDateString(), item.inspectionTime, <StatusBadge status={item.status} />, item.result ?? "-", canComplete && item.status !== "COMPLETED" ? <button className="font-semibold text-fire" onClick={() => setSelected(item)}>Record result</button> : "-"]);
  return <><div className="flex items-start justify-between gap-4"><PageHeader title="Inspections" description={canComplete ? "Conduct inspections, record results, and manage scheduled work." : "View inspection history and schedule required inspections."} /><button className="rounded-lg bg-fire px-4 py-2 text-sm font-semibold text-white" onClick={() => setOpen(true)}>Schedule inspection</button></div><DataTable headers={["Extinguisher", "Location", "Date", "Time", "Status", "Result", "Actions"]} rows={rows} />{open && <ModalForm title="Schedule inspection" onClose={() => setOpen(false)}><form className="grid gap-4" onSubmit={submit}><label className="text-sm font-medium">Extinguisher<select className="mt-1 w-full rounded-lg border px-3 py-2" required value={form.extinguisherId} onChange={(event) => setForm({ ...form, extinguisherId: event.target.value })}><option value="">Select equipment</option>{extinguishers.map((item) => <option key={item.id} value={item.id}>{item.serialNumber} - {item.location}</option>)}</select></label><label className="text-sm font-medium">Date<input className="mt-1 w-full rounded-lg border px-3 py-2" required type="date" value={form.inspectionDate} onChange={(event) => setForm({ ...form, inspectionDate: event.target.value })} /></label><label className="text-sm font-medium">Time<input className="mt-1 w-full rounded-lg border px-3 py-2" required type="time" value={form.inspectionTime} onChange={(event) => setForm({ ...form, inspectionTime: event.target.value })} /></label><button className="rounded-lg bg-fire px-4 py-2 font-semibold text-white">Schedule</button></form></ModalForm>}{selected && <ModalForm title="Record inspection result" onClose={() => setSelected(null)}><form className="grid gap-4" onSubmit={saveResult}><p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">{selected.extinguisher.serialNumber} - {selected.extinguisher.location}</p><label className="text-sm font-medium">Status<select className="mt-1 w-full rounded-lg border px-3 py-2" value={result.status} onChange={(event) => setResult({ ...result, status: event.target.value })}><option value="COMPLETED">Completed</option><option value="CANCELLED">Cancelled</option></select></label><label className="text-sm font-medium">Result<textarea className="mt-1 w-full rounded-lg border px-3 py-2" required={result.status === "COMPLETED"} value={result.result} onChange={(event) => setResult({ ...result, result: event.target.value })} /></label><label className="text-sm font-medium">Notes<textarea className="mt-1 w-full rounded-lg border px-3 py-2" value={result.notes} onChange={(event) => setResult({ ...result, notes: event.target.value })} /></label><button className="rounded-lg bg-fire px-4 py-2 font-semibold text-white">Save result</button></form></ModalForm>}</>;
}
