import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../auth/AuthContext";
import { DataTable } from "../components/DataTable";
import { ModalForm } from "../components/ModalForm";
import { PageHeader } from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { api } from "../lib/api";
import type { Extinguisher } from "../lib/types";
import { EXTINGUISHER_SIZES } from "../lib/types";

type ExtinguisherForm = {
  serialNumber: string;
  location: string;
  type: string;
  size: string;
  installationDate: string;
  expiryDate: string;
  status: string;
};

const empty: ExtinguisherForm = {
  serialNumber: "",
  location: "",
  type: "CO2",
  size: "5 lbs.",
  installationDate: "",
  expiryDate: "",
  status: "ACTIVE"
};

const REGISTER_STATUSES = ["ACTIVE", "OUT_OF_SERVICE", "UNDER_MAINTENANCE"] as const;
const EDIT_STATUSES = ["ACTIVE", "EXPIRED", "OUT_OF_SERVICE", "UNDER_MAINTENANCE"] as const;
const TYPE_OPTIONS = ["WATER", "FOAM", "CO2", "DRY_POWDER", "WET_CHEMICAL"] as const;

const today = () => new Date().toISOString().slice(0, 10);

/** Formats ISO dates for display in tables and detail views. */
function formatDate(value: string) {
  return new Date(value).toLocaleDateString();
}

/** Builds the extinguishers list URL with an optional search query. */
function listPath(search: string) {
  const params = new URLSearchParams();
  if (search.trim()) params.set("search", search.trim());
  const query = params.toString();
  return `/extinguishers${query ? `?${query}` : ""}`;
}

/** Validates create/edit form values before calling the API. */
function validateExtinguisherForm(form: ExtinguisherForm, isEdit: boolean): string | null {
  if (!form.installationDate) return "Installation date is required";
  if (!form.expiryDate) return "Expiry date is required";
  if (form.installationDate > today()) return "Installation date cannot be in the future";
  if (form.expiryDate <= form.installationDate) return "Expiry date must be after installation date";
  if (!isEdit && form.status === "EXPIRED") {
    return "New extinguishers cannot be registered with an expired status";
  }
  if (form.status === "ACTIVE" && form.expiryDate <= today()) {
    return "Cannot register an active extinguisher that is already expired";
  }
  return null;
}

export function ExtinguishersPage() {
  const { user } = useAuth();
  const client = useQueryClient();
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<ExtinguisherForm>(empty);
  const [editing, setEditing] = useState<Extinguisher | null>(null);
  const [open, setOpen] = useState(false);
  const [detailId, setDetailId] = useState<string | null>(null);

  const { data = [] } = useQuery({
    queryKey: ["extinguishers", search],
    queryFn: () => api<Extinguisher[]>(listPath(search))
  });

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ["extinguisher", detailId],
    queryFn: () => api<Extinguisher>(`/extinguishers/${detailId}`),
    enabled: !!detailId
  });

  /** Keeps controlled form fields in sync with user input. */
  function change(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  /** Opens the create or edit modal and pre-fills values when editing. */
  function show(item?: Extinguisher) {
    setEditing(item ?? null);
    setForm(item ? {
      serialNumber: item.serialNumber,
      location: item.location,
      type: item.type,
      size: (EXTINGUISHER_SIZES as readonly string[]).includes(item.size) ? item.size : "5 lbs.",
      installationDate: item.installationDate.slice(0, 10),
      expiryDate: item.expiryDate.slice(0, 10),
      status: item.status
    } : empty);
    setOpen(true);
  }

  /** Loads full extinguisher details through the by-id API. */
  function viewDetails(id: string) {
    setDetailId(id);
  }

  /** Creates or updates an extinguisher after client-side validation passes. */
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const validationError = validateExtinguisherForm(form, !!editing);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    try {
      await api(editing ? `/extinguishers/${editing.id}` : "/extinguishers", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(form)
      });
      toast.success(editing ? "Extinguisher updated" : "Extinguisher registered");
      setOpen(false);
      client.invalidateQueries({ queryKey: ["extinguishers"] });
      if (editing) client.invalidateQueries({ queryKey: ["extinguisher", editing.id] });
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  /** Removes an extinguisher from inventory (admin only). */
  async function remove(id: string) {
    try {
      await api(`/extinguishers/${id}`, { method: "DELETE" });
      toast.success("Extinguisher deleted");
      setDetailId(null);
      client.invalidateQueries({ queryKey: ["extinguishers"] });
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  const minExpiryDate = form.installationDate
    ? (() => {
        const next = new Date(`${form.installationDate}T00:00:00`);
        next.setDate(next.getDate() + 1);
        return next.toISOString().slice(0, 10);
      })()
    : undefined;

  const statusOptions = editing ? EDIT_STATUSES : REGISTER_STATUSES;

  const rows = data.map((item) => [
    item.serialNumber,
    item.location,
    item.type.replaceAll("_", " "),
    item.size,
    formatDate(item.installationDate),
    formatDate(item.expiryDate),
    <StatusBadge status={item.status} />,
    <div className="flex gap-2">
      <button className="text-fire" onClick={() => viewDetails(item.id)} type="button">View</button>
      {user?.role === "ADMIN" && (
        <>
          <button className="text-fire" onClick={() => show(item)} type="button">Edit</button>
          <button className="text-slate-500" onClick={() => remove(item.id)} type="button">Delete</button>
        </>
      )}
    </div>
  ]);

  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <PageHeader title="Fire Extinguishers" description="Search, review, and manage the active equipment inventory." />
        {user?.role === "ADMIN" && (
          <button className="rounded-lg bg-fire px-4 py-2 text-sm font-semibold text-white" onClick={() => show()} type="button">
            Register extinguisher
          </button>
        )}
      </div>

      <label className="relative mb-4 block max-w-md">
        <Search className="absolute left-3 top-3 text-slate-400" size={18} />
        <input
          className="w-full rounded-lg border border-slate-200 py-2.5 pl-10 pr-3 outline-none focus:border-fire focus:ring-2 focus:ring-red-100"
          placeholder="Search by serial number or location..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </label>

      <DataTable
        headers={["Serial", "Location", "Type", "Size", "Installed", "Expiry", "Status", "Actions"]}
        rows={rows}
      />

      {detailId && (
        <ModalForm title="Extinguisher details" onClose={() => setDetailId(null)}>
          {detailLoading || !detail ? (
            <p className="text-sm text-slate-500">Loading extinguisher details...</p>
          ) : (
            <dl className="grid gap-4 sm:grid-cols-2">
              <div><dt className="text-xs uppercase text-slate-400">Serial number</dt><dd className="mt-1 font-semibold">{detail.serialNumber}</dd></div>
              <div><dt className="text-xs uppercase text-slate-400">Status</dt><dd className="mt-1"><StatusBadge status={detail.status} /></dd></div>
              <div className="sm:col-span-2"><dt className="text-xs uppercase text-slate-400">Location</dt><dd className="mt-1 font-semibold">{detail.location}</dd></div>
              <div><dt className="text-xs uppercase text-slate-400">Type</dt><dd className="mt-1 font-semibold">{detail.type.replaceAll("_", " ")}</dd></div>
              <div><dt className="text-xs uppercase text-slate-400">Size</dt><dd className="mt-1 font-semibold">{detail.size}</dd></div>
              <div><dt className="text-xs uppercase text-slate-400">Installation date</dt><dd className="mt-1 font-semibold">{formatDate(detail.installationDate)}</dd></div>
              <div><dt className="text-xs uppercase text-slate-400">Expiry date</dt><dd className="mt-1 font-semibold">{formatDate(detail.expiryDate)}</dd></div>
              <div className="sm:col-span-2"><dt className="text-xs uppercase text-slate-400">Record ID</dt><dd className="mt-1 break-all font-mono text-xs text-slate-500">{detail.id}</dd></div>
            </dl>
          )}
          {user?.role === "ADMIN" && detail && (
            <div className="mt-6 flex gap-2">
              <button className="rounded-lg bg-fire px-4 py-2 text-sm font-semibold text-white" onClick={() => { setDetailId(null); show(detail); }} type="button">
                Edit extinguisher
              </button>
            </div>
          )}
        </ModalForm>
      )}

      {open && (
        <ModalForm title={editing ? "Edit extinguisher" : "Register extinguisher"} onClose={() => setOpen(false)}>
          <form className="grid gap-4" onSubmit={submit}>
            <label className="text-sm font-medium">
              Serial number
              <input className="mt-1 w-full rounded-lg border px-3 py-2" name="serialNumber" required value={form.serialNumber} onChange={change} />
            </label>
            <label className="text-sm font-medium">
              Location
              <input className="mt-1 w-full rounded-lg border px-3 py-2" name="location" required value={form.location} onChange={change} />
            </label>
            <label className="text-sm font-medium">
              Type
              <select className="mt-1 w-full rounded-lg border px-3 py-2" name="type" value={form.type} onChange={change}>
                {TYPE_OPTIONS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Size
              <select className="mt-1 w-full rounded-lg border px-3 py-2" name="size" value={form.size} onChange={change}>
                {EXTINGUISHER_SIZES.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium">
              Installation date
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                name="installationDate"
                required
                type="date"
                max={today()}
                value={form.installationDate}
                onChange={change}
              />
            </label>
            <label className="text-sm font-medium">
              Expiry date
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2"
                name="expiryDate"
                required
                type="date"
                min={minExpiryDate}
                value={form.expiryDate}
                onChange={change}
              />
            </label>
            <label className="text-sm font-medium">
              Status
              <select className="mt-1 w-full rounded-lg border px-3 py-2" name="status" value={form.status} onChange={change}>
                {statusOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <p className="text-xs text-slate-500">
              {editing
                ? "Expiry must be after installation. Use expired status only when updating existing equipment."
                : "New installations cannot be registered as expired. Expiry must be after installation."}
            </p>
            <button className="rounded-lg bg-fire px-4 py-2 font-semibold text-white" type="submit">Save</button>
          </form>
        </ModalForm>
      )}
    </>
  );
}
