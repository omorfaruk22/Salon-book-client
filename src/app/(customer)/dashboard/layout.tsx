import { CustomerDashboardLayout } from "@/features/appointments/components/customer-dashboard-layout";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <CustomerDashboardLayout>{children}</CustomerDashboardLayout>;
}
