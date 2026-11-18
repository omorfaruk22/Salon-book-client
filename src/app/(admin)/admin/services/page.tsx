import { AdminServiceManager } from "@/features/services/components/admin-service-manager";
export default function AdminServicesPage() { return <main className="mx-auto max-w-6xl p-6 md:p-8"><p className="text-sm font-semibold uppercase tracking-[.2em] text-[var(--green-light)]">Admin</p><h1 className="mt-3 text-3xl font-semibold">Manage services</h1><p className="mt-2 text-[var(--muted)]">Maintain the salon menu, pricing, and availability.</p><AdminServiceManager /></main>; }

