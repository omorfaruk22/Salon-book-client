import { AdminCustomerManager } from "@/features/auth/components/admin-customer-manager";
export default function AdminCustomersPage() { return <main className="mx-auto max-w-6xl p-6 md:p-8"><p className="text-sm font-semibold uppercase tracking-[.2em] text-[var(--green-light)]">Admin</p><h1 className="mt-3 text-3xl font-semibold">Manage customers</h1><p className="mt-2 text-[var(--muted)]">Search customer accounts and manage access.</p><AdminCustomerManager /></main>; }

