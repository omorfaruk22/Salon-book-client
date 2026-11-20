import { AuthGate } from "@/components/layout/auth-gate";
import { AdminDashboardLayout } from "@/features/admin/components/admin-dashboard-layout";

export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AuthGate role="admin"><AdminDashboardLayout>{children}</AdminDashboardLayout></AuthGate>;
}
