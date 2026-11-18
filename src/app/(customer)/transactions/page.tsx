import { TransactionHistory } from "@/features/appointments/components/transaction-history";
export default function PaymentHistoryPage() { return <main className="mx-auto max-w-5xl p-6 md:p-8"><p className="text-sm font-semibold uppercase tracking-[.2em] text-[var(--green-light)]">Payments</p><h1 className="mt-3 text-3xl font-semibold">Payment history</h1><p className="mt-2 text-[var(--muted)]">See payment updates for your salon appointments.</p><TransactionHistory /></main>; }

