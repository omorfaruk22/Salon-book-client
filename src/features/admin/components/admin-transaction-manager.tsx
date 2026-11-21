"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, CircleDollarSign, CreditCard, Search, Users, X } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import type { AdminSalonTransaction } from "@/types/appointment";
import type { ApiEnvelope } from "@/types/service";
import { TransactionStatus } from "@/features/appointments/components/transaction-history";

type Stats = { totalTransactions: number; successfulPayments: number; totalRevenue: number; uniquePayingCustomers: number; currency: string; revenueBasis: string };
type Result = { transactions: AdminSalonTransaction[]; page: number; limit: number; total: number; totalPages: number };
type Filters = { search: string; status: string; dateFrom: string; dateTo: string; sort: string; page: number };
const initialFilters: Filters = { search: "", status: "all", dateFrom: "", dateTo: "", sort: "newest", page: 1 };

export function AdminTransactionManager() {
  const [filters, setFilters] = useState(initialFilters);
  const [rows, setRows] = useState<AdminSalonTransaction[]>([]);
  const [meta, setMeta] = useState({ page: 1, total: 0, totalPages: 0 });
  const [stats, setStats] = useState<Stats | null>(null);
  const [selected, setSelected] = useState<AdminSalonTransaction | null>(null);
  const [detail, setDetail] = useState<AdminSalonTransaction | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const load = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: String(filters.page), limit: "10", sort: filters.sort, status: filters.status });
      if (filters.search.trim()) query.set("search", filters.search.trim());
      if (filters.dateFrom) query.set("dateFrom", filters.dateFrom);
      if (filters.dateTo) query.set("dateTo", filters.dateTo);
      const [listResponse, statsResponse] = await Promise.all([
        apiFetch(`/admin/transactions?${query.toString()}`, { signal, cache: "no-store" }),
        stats ? Promise.resolve(null) : apiFetch("/admin/transactions/stats", { signal, cache: "no-store" }),
      ]);
      const listResult = await listResponse.json().catch(() => null) as ApiEnvelope<Result> | null;
      if (!listResponse.ok || !listResult?.data) throw new Error(listResult?.error?.message ?? "Could not load transactions.");
      let statsResult: ApiEnvelope<Stats> | null = null;
      if (statsResponse) {
        statsResult = await statsResponse.json().catch(() => null) as ApiEnvelope<Stats> | null;
        if (!statsResponse.ok || !statsResult?.data) throw new Error(statsResult?.error?.message ?? "Could not load transaction summary.");
      }
      if (signal.aborted) return;
      setRows(listResult.data.transactions); setMeta({ page: listResult.data.page, total: listResult.data.total, totalPages: listResult.data.totalPages });
      if (statsResult?.data) setStats(statsResult.data);
      setError("");
    } catch (cause) { if (!signal.aborted) { setRows([]); setError(cause instanceof Error ? cause.message : "Could not load transactions."); } }
    finally { if (!signal.aborted) setLoading(false); }
  }, [filters, stats]);

  useEffect(() => { const controller = new AbortController(); const timer = window.setTimeout(() => void load(controller.signal), 180); return () => { window.clearTimeout(timer); controller.abort(); }; }, [load, retry]);

  async function viewDetails(transaction: AdminSalonTransaction) {
    setSelected(transaction); setDetail(null); setDetailLoading(true);
    try {
      const response = await apiFetch(`/admin/transactions/${transaction._id}`, { cache: "no-store" });
      const result = await response.json().catch(() => null) as ApiEnvelope<AdminSalonTransaction> | null;
      if (!response.ok || !result?.data) throw new Error(result?.error?.message ?? "Could not load transaction details.");
      setDetail(result.data);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load transaction details."); }
    finally { setDetailLoading(false); }
  }

  const currency = stats?.currency.toUpperCase() ?? "BDT";
  const money = (amount: number, code = currency) => new Intl.NumberFormat("en-BD", { style: "currency", currency: code, maximumFractionDigits: 2 }).format(amount);
  const metricItems = [
    { title: "All attempts", value: stats?.totalTransactions ?? 0, icon: CreditCard, help: "Payment records" },
    { title: "Verified payments", value: stats?.successfulPayments ?? 0, icon: CircleDollarSign, help: "Paid or refunded" },
    { title: "Gross collected", value: money(stats?.totalRevenue ?? 0), icon: CircleDollarSign, help: "Before refunds" },
    { title: "Paying customers", value: stats?.uniquePayingCustomers ?? 0, icon: Users, help: "Unique accounts" },
  ];

  function update(key: keyof Filters, value: string | number) { setFilters((current) => ({ ...current, [key]: value, ...(key === "page" ? {} : { page: 1 }) })); setSelected(null); setDetail(null); }
  return <div className="space-y-6">
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Transaction summary">{metricItems.map(({ title, value, icon: Icon, help }) => <article key={title} className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5"><div className="flex items-center justify-between"><p className="text-sm text-[var(--muted)]">{title}</p><Icon className="size-4 text-[var(--green-light)]" aria-hidden="true" /></div><p className="mt-4 text-2xl font-semibold">{value}</p><p className="mt-1 text-xs text-[var(--muted)]">{help}</p></article>)}</section>
    {error && <p role="alert" className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">{error}<button type="button" onClick={() => setRetry((value) => value + 1)} className="ml-3 underline">Retry</button></p>}
    <section className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5" aria-label="Transaction filters">
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"><label className="relative min-w-0"><span className="sr-only">Search customer, service, or reference</span><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" aria-hidden="true" /><input value={filters.search} onChange={(event) => update("search", event.target.value)} placeholder="Search customer, service, reference" className="min-h-11 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] pl-10 pr-3 text-sm outline-none focus:border-[var(--green-light)]" /></label><label className="flex min-h-11 min-w-0 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm"><span className="text-[var(--muted)]">Status</span><select value={filters.status} onChange={(event) => update("status", event.target.value)} className="min-w-0 flex-1 bg-transparent text-[var(--foreground)] outline-none"><option value="all">All</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="failed">Failed</option><option value="refunded">Refunded</option></select></label><label className="relative min-w-0"><span className="sr-only">From date</span><CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" aria-hidden="true" /><input aria-label="From date" type="date" value={filters.dateFrom} onChange={(event) => update("dateFrom", event.target.value)} className="min-h-11 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 pl-10 text-sm text-[var(--foreground)]" /></label><label className="relative min-w-0"><span className="sr-only">To date</span><CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" aria-hidden="true" /><input aria-label="To date" type="date" value={filters.dateTo} onChange={(event) => update("dateTo", event.target.value)} className="min-h-11 w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 pl-10 text-sm text-[var(--foreground)]" /></label><label className="flex min-h-11 min-w-0 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm"><span className="text-[var(--muted)]">Sort</span><select value={filters.sort} onChange={(event) => update("sort", event.target.value)} className="min-w-0 flex-1 bg-transparent text-[var(--foreground)] outline-none"><option value="newest">Newest</option><option value="oldest">Oldest</option></select></label></div>
      <div className="overflow-x-auto rounded-xl border border-[var(--border)]"><table className="w-full min-w-[920px] text-left text-sm"><thead className="bg-[var(--card)] text-xs uppercase tracking-wider text-[var(--muted)]"><tr><th className="px-4 py-3">Transaction / Service</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Details</th></tr></thead><tbody>{!loading && rows.map((row) => <tr key={row._id} className="border-t border-[var(--border)]"><td className="px-4 py-4"><p className="font-medium">{row.serviceName}</p><p className="mt-1 font-mono text-[10px] text-[var(--muted)]">{row._id.toUpperCase()}</p></td><td className="px-4 py-4"><p className="font-medium">{row.customer.name}</p><p className="mt-1 text-xs text-[var(--muted)]">{row.customer.email || "Email unavailable"}</p></td><td className="px-4 py-4 font-medium whitespace-nowrap">{money(row.amount, row.currency.toUpperCase())}</td><td className="px-4 py-4"><TransactionStatus status={row.status} /></td><td className="px-4 py-4 whitespace-nowrap text-[var(--muted)]">{new Date(row.paidAt ?? row.createdAt).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}</td><td className="px-4 py-4"><button type="button" aria-expanded={selected?._id === row._id} onClick={() => void viewDetails(row)} className="min-h-9 rounded-lg border border-[var(--border)] px-3 text-xs font-medium hover:border-[var(--green-light)]">View</button></td></tr>)}</tbody></table>{loading && <p className="p-8 text-center text-sm text-[var(--muted)]">Loading transactions…</p>}{!loading && !rows.length && !error && <p className="p-10 text-center text-sm text-[var(--muted)]">No transactions match these filters.</p>}</div>
      {!loading && meta.totalPages > 0 && <nav aria-label="Transaction pages" className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-[var(--muted)]">{meta.total} records · Page {meta.page} of {meta.totalPages}</p><div className="flex gap-2"><button type="button" disabled={filters.page <= 1} onClick={() => update("page", filters.page - 1)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm disabled:opacity-40"><ArrowLeft className="size-4" />Previous</button><button type="button" disabled={filters.page >= meta.totalPages} onClick={() => update("page", filters.page + 1)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm disabled:opacity-40">Next<ArrowRight className="size-4" /></button></div></nav>}
    </section>
    {selected && <section aria-labelledby="transaction-detail-title" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-[var(--green-light)]">Transaction details</p><h2 id="transaction-detail-title" className="mt-1 text-lg font-semibold">{selected._id.toUpperCase()}</h2></div><button type="button" onClick={() => { setSelected(null); setDetail(null); }} aria-label="Close transaction details" className="grid size-9 place-items-center rounded-lg border border-[var(--border)] hover:text-white"><X className="size-4" /></button></div>{detailLoading ? <p className="py-7 text-sm text-[var(--muted)]">Loading details…</p> : detail && <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><Detail label="Customer" value={detail.customer.name} /><Detail label="Email" value={detail.customer.email || "Unavailable"} /><Detail label="Appointment reference" value={detail.appointmentId} mono /><Detail label="Service" value={detail.serviceName} /><Detail label="Amount" value={money(detail.amount, detail.currency.toUpperCase())} /><Detail label="Payment method" value={detail.paymentMethod ?? "Card via Stripe"} /><Detail label="Status" value={detail.status} /><Detail label="Created" value={new Date(detail.createdAt).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })} /><Detail label="Paid at" value={detail.paidAt ? new Date(detail.paidAt).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" }) : "Not paid"} /></dl>}</section>}
  </div>;
}

function Detail({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) { return <div className="min-w-0"><dt className="text-xs text-[var(--muted)]">{label}</dt><dd className={`mt-1 break-words font-medium ${mono ? "font-mono text-xs" : "text-sm"}`}>{value}</dd></div>; }
