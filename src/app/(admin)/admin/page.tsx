import { DashboardOverview } from "@/features/appointments/components/dashboard-overview";
export default function AdminDashboardPage() { return <main className="mx-auto max-w-6xl p-6 md:p-8"><p className="text-sm font-semibold uppercase tracking-[.2em] text-[var(--green-light)]">SalonBook</p><h1 className="mt-3 text-3xl font-semibold">Admin overview</h1><p className="mt-2 text-[var(--muted)]">Review bookings, services, customers, and paid revenue.</p><DashboardOverview admin /></main>; }

