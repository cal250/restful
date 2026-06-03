import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";
import { AppShell } from "./components/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { ExtinguishersPage } from "./pages/ExtinguishersPage";
import { InspectionsPage } from "./pages/InspectionsPage";
import { LoginPage } from "./pages/LoginPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { MaintenancePage } from "./pages/MaintenancePage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ReportsPage } from "./pages/ReportsPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { UsersPage } from "./pages/UsersPage";

/** Renders public auth routes or the authenticated app shell based on login state. */
export function App() {
  const { user } = useAuth();
  if (!user) return <Routes><Route path="/login" element={<LoginPage />} /><Route path="/register" element={<RegisterPage />} /><Route path="/forgot-password" element={<ForgotPasswordPage />} /><Route path="/reset-password" element={<ResetPasswordPage />} /><Route path="*" element={<Navigate to="/login" />} /></Routes>;
  return <Routes><Route element={<AppShell />}><Route index element={<DashboardPage />} /><Route path="extinguishers" element={<ExtinguishersPage />} /><Route path="inspections" element={<InspectionsPage />} /><Route path="maintenance" element={user.role !== "USER" ? <MaintenancePage /> : <Navigate to="/" />} /><Route path="reports" element={<ReportsPage />} /><Route path="notifications" element={<NotificationsPage />} /><Route path="users" element={user.role === "ADMIN" ? <UsersPage /> : <Navigate to="/" />} /><Route path="profile" element={<ProfilePage />} /><Route path="*" element={<Navigate to="/" />} /></Route></Routes>;
}
