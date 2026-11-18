import { TransactionHistory } from "@/features/appointments/components/transaction-history";
export default function AdminTransactionsPage() { return <main className="mx-auto max-w-6xl p-6 md:p-8"><p className="text-sm font-semibold uppercase tracking-[.2em] text-[var(--green-light)]">Admin</p><h1 className="mt-3 text-3xl font-semibold">Transactions</h1><p className="mt-2 text-[var(--muted)]">Review customer payment records.</p><TransactionHistory admin /></main>; }

