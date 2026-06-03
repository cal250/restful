import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { DataTable } from "../components/DataTable";
import { PageHeader } from "../components/PageHeader";
import { api } from "../lib/api";
import type { Role, User } from "../lib/types";

export function UsersPage() {
  const client = useQueryClient();
  const { data = [] } = useQuery({ queryKey: ["users"], queryFn: () => api<User[]>("/users") });
  async function update(id: string, input: { role?: Role; isActive?: boolean }) {
    try {
      await api(`/users/${id}`, { method: "PATCH", body: JSON.stringify(input) });
      toast.success("User access updated");
      client.invalidateQueries({ queryKey: ["users"] });
    } catch (error) { toast.error((error as Error).message); }
  }
  const rows = data.map((user) => [
    `${user.firstName} ${user.lastName}`,
    user.email,
    user.role === "ADMIN" ? <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">Admin</span> : <select className="rounded-lg border px-2 py-1.5 text-sm" value={user.role} onChange={(event) => update(user.id, { role: event.target.value as Role })}><option value="USER">User</option><option value="INSPECTOR">Inspector</option></select>,
    <button className={`rounded-full px-3 py-1 text-xs font-semibold ${user.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`} onClick={() => update(user.id, { isActive: !user.isActive })}>{user.isActive ? "Active" : "Inactive"}</button>
  ]);
  return <><PageHeader title="Users" description="New accounts start as users. Promote trusted team members to inspector access when required." /><DataTable headers={["Name", "Email", "Role", "Status"]} rows={rows} /></>;
}
