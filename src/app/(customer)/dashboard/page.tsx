import { DashboardOverview } from "@/features/appointments/components/dashboard-overview";
export default function CustomerDashboardPage() { return <main className="mx-auto max-w-6xl p-6 md:p-8"><p className="text-sm font-semibold uppercase tracking-[.2em] text-[var(--green-light)]">SalonBook</p><h1 className="mt-3 text-3xl font-semibold">Your dashboard</h1><p className="mt-2 text-[var(--muted)]">A quick look at your bookings and payments.</p><DashboardOverview /></main>; }

