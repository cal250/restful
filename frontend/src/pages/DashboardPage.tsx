import { useAuth } from "../auth/AuthContext";
import { AdminDashboard } from "../components/dashboard/AdminDashboard";
import { InspectorDashboard } from "../components/dashboard/InspectorDashboard";
import { UserDashboard } from "../components/dashboard/UserDashboard";
import { PageHeader } from "../components/PageHeader";

const descriptions = {
  ADMIN: "Manage the overall system, user access, compliance, and data integrity.",
  INSPECTOR: "Conduct inspections, log results, and record maintenance activity.",
  USER: "View extinguisher status, schedule inspections, and follow inspection history."
};

export function DashboardPage() {
  const { user } = useAuth();
  return <><PageHeader title={`${user?.role === "ADMIN" ? "Admin" : user?.role === "INSPECTOR" ? "Inspector" : "User"} Dashboard`} description={descriptions[user!.role]} />{user?.role === "ADMIN" ? <AdminDashboard /> : user?.role === "INSPECTOR" ? <InspectorDashboard /> : <UserDashboard />}</>;
}
