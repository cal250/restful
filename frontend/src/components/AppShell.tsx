import { BarChart3, Bell, ClipboardCheck, LayoutDashboard, ShieldCheck, UserRound, Users, Wrench } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import type { Role } from "../lib/types";

const links = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard, roles: ["ADMIN", "INSPECTOR", "USER"] },
  { label: "Extinguishers", path: "/extinguishers", icon: ShieldCheck, roles: ["ADMIN", "INSPECTOR", "USER"] },
  { label: "Inspections", path: "/inspections", icon: ClipboardCheck, roles: ["ADMIN", "INSPECTOR", "USER"] },
  { label: "Maintenance", path: "/maintenance", icon: Wrench, roles: ["ADMIN", "INSPECTOR"] },
  { label: "Reports", path: "/reports", icon: BarChart3, roles: ["ADMIN", "INSPECTOR", "USER"] },
  { label: "Users", path: "/users", icon: Users, roles: ["ADMIN"] },
  { label: "Notifications", path: "/notifications", icon: Bell, roles: ["ADMIN", "INSPECTOR", "USER"] },
  { label: "Profile", path: "/profile", icon: UserRound, roles: ["ADMIN", "INSPECTOR", "USER"] }
] as const;

export function AppShell() {
  const { user, logout } = useAuth();
  const visible = links.filter((link) => link.roles.includes(user!.role as never));
  return <div className="min-h-screen bg-slate-50 md:flex"><aside className="bg-nav p-5 text-white md:min-h-screen md:w-64"><p className="text-xs font-semibold uppercase tracking-widest text-red-300">TZW LTD</p><p className="mt-2 text-lg font-bold">Fire Safety</p><p className="mt-1 text-xs text-slate-400">{roleLabel(user!.role)} workspace</p><nav className="mt-8 flex gap-2 overflow-x-auto md:flex-col">{visible.map(({ label, path, icon: Icon }) => <NavLink className={({ isActive }) => `flex whitespace-nowrap rounded-lg px-3 py-2 text-sm ${isActive ? "bg-fire text-white" : "text-slate-300 hover:bg-white/10"}`} key={path} to={path}><Icon className="mr-2" size={17} />{label}</NavLink>)}</nav></aside><div className="flex-1"><header className="flex items-center justify-between border-b bg-white px-6 py-4"><div><p className="text-sm font-semibold">{user?.firstName} {user?.lastName}</p><p className="text-xs text-slate-400">{roleLabel(user!.role)}</p></div><button className="rounded-lg border px-3 py-2 text-sm hover:bg-slate-50" onClick={logout}>Logout</button></header><main className="p-6"><Outlet /></main></div></div>;
}

function roleLabel(role: Role) {
  return role === "ADMIN" ? "Administrator" : role === "INSPECTOR" ? "Inspector" : "User";
}
