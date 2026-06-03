import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Bell,
  ClipboardCheck,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserRound,
  Users,
  Wrench
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { NotificationPanel, unreadNotificationCount } from "./NotificationPanel";
import { api } from "../lib/api";
import type { NotificationItem } from "./NotificationPanel";
import type { Role } from "../lib/types";

const links = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard, roles: ["ADMIN", "INSPECTOR", "USER"] },
  { label: "Extinguishers", path: "/extinguishers", icon: ShieldCheck, roles: ["ADMIN", "INSPECTOR", "USER"] },
  { label: "Inspections", path: "/inspections", icon: ClipboardCheck, roles: ["ADMIN", "INSPECTOR", "USER"] },
  { label: "Maintenance", path: "/maintenance", icon: Wrench, roles: ["ADMIN", "INSPECTOR"] },
  { label: "Reports", path: "/reports", icon: BarChart3, roles: ["ADMIN", "INSPECTOR", "USER"] },
  { label: "Users", path: "/users", icon: Users, roles: ["ADMIN"] },
  { label: "Profile", path: "/profile", icon: UserRound, roles: ["ADMIN", "INSPECTOR", "USER"] }
] as const;

/** Renders the authenticated app layout with role-filtered navigation. */
export function AppShell() {
  const { user, logout } = useAuth();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const visible = links.filter((link) => link.roles.includes(user!.role as never));

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api<NotificationItem[]>("/notifications")
  });

  const unreadCount = unreadNotificationCount(notifications);

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="flex min-h-screen w-full flex-col bg-nav p-5 text-white md:w-64">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-red-300">TZW LTD</p>
          <p className="mt-2 text-lg font-bold">Fire Safety</p>
          <p className="mt-1 text-xs text-slate-400">{roleLabel(user!.role)} workspace</p>
        </div>

        <nav className="mt-8 flex flex-1 gap-2 overflow-x-auto md:flex-col">
          {visible.map(({ label, path, icon: Icon }) => (
            <NavLink
              className={({ isActive }) =>
                `flex whitespace-nowrap rounded-lg px-3 py-2 text-sm ${
                  isActive ? "bg-fire text-white" : "text-slate-300 hover:bg-white/10"
                }`
              }
              key={path}
              to={path}
            >
              <Icon className="mr-2 inline" size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          className="mt-6 flex w-full items-center rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10"
          onClick={logout}
          type="button"
        >
          <LogOut className="mr-2" size={17} />
          Logout
        </button>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-white px-6 py-4">
          <div>
            <p className="text-sm font-semibold">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-400">{roleLabel(user!.role)}</p>
          </div>

          <button
            aria-label="Open notifications"
            className="relative rounded-lg border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 hover:text-fire"
            onClick={() => setNotificationsOpen(true)}
            type="button"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-fire px-1.5 text-[11px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>

      <NotificationPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}

/** Returns a human-readable label for a user role. */
function roleLabel(role: Role) {
  return role === "ADMIN" ? "Administrator" : role === "INSPECTOR" ? "Inspector" : "User";
}
