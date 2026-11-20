"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ReceiptText } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import type { ApiEnvelope } from "@/types/service";
import type { SalonTransaction } from "@/types/appointment";

type Meta = { page: number; limit: number; total: number; totalPages: number };
const money = new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 2 });

export function TransactionHistory() {
  const [items, setItems] = useState<SalonTransaction[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    try {
      const response = await apiFetch(`/transactions?page=${page}&limit=10`, { signal, cache: "no-store" });
      const result = await response.json().catch(() => null) as (ApiEnvelope<SalonTransaction[]> & { meta?: Meta }) | null;
      if (!response.ok || !result?.data) throw new Error(result?.error?.message ?? "Could not load payment history.");
      if (!signal.aborted) { setItems(result.data); setMeta(result.meta ?? { page, limit: 10, total: result.data.length, totalPages: 1 }); setError(""); }
    } catch (cause) {
      if (!signal.aborted) { setError(cause instanceof Error ? cause.message : "Could not load payment history."); setItems([]); }
    } finally { if (!signal.aborted) setLoading(false); }
  }, [page]);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);

  return <div className="mt-8 space-y-5">
    {error && <p role="alert" className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">{error}</p>}
    {loading ? <p className="py-12 text-center text-[var(--muted)]">Loading payment history…</p> : items.length ? <>
      <div className="overflow-x-auto rounded-2xl border border-[var(--border)]"><table className="w-full min-w-[700px] text-left text-sm"><thead className="bg-[var(--surface)] text-[var(--muted)]"><tr><th className="px-5 py-4 font-medium">Service</th><th className="px-5 py-4 font-medium">Amount</th><th className="px-5 py-4 font-medium">Status</th><th className="px-5 py-4 font-medium">Date</th><th className="px-5 py-4 font-medium">Receipt</th></tr></thead><tbody>{items.map((item) => <tr key={item._id} className="border-t border-[var(--border)]"><td className="px-5 py-4"><p className="font-medium">{item.serviceName}</p><p className="mt-1 text-xs text-[var(--muted)]">Appointment {item.appointmentId.slice(-8).toUpperCase()}</p></td><td className="px-5 py-4 font-medium">{money.format(item.amount)}</td><td className="px-5 py-4"><TransactionStatus status={item.status} /></td><td className="px-5 py-4 text-[var(--muted)]">{new Date(item.paidAt ?? item.createdAt).toLocaleString("en-BD", { dateStyle: "medium", timeStyle: "short" })}</td><td className="px-5 py-4"><Link href={`/transactions/${item._id}`} aria-label={`View ${item.serviceName} receipt`} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-[var(--border)] px-3 text-xs font-medium hover:border-[var(--green-light)]"><ReceiptText className="size-4" aria-hidden="true" />View</Link></td></tr>)}</tbody></table></div>
      {meta.totalPages > 1 && <nav aria-label="Payment history pages" className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-[var(--muted)]">{meta.total} records · Page {page} of {meta.totalPages}</p><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm disabled:opacity-40"><ArrowLeft className="size-4" aria-hidden="true" />Previous</button><button type="button" disabled={page >= meta.totalPages} onClick={() => setPage((current) => current + 1)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm disabled:opacity-40">Next<ArrowRight className="size-4" aria-hidden="true" /></button></div></nav>}
    </> : !error && <div className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center"><h2 className="text-lg font-semibold">No payment records</h2><p className="mt-2 text-sm text-[var(--muted)]">Confirmed appointments can be paid from your appointment list.</p><Link href="/dashboard/my-appointments" className="mt-4 inline-flex text-sm text-[var(--green-light)] hover:underline">View appointments</Link></div>}
  </div>;
}

export function TransactionStatus({ status }: { status: string }) {
  const classes = status === "paid" ? "bg-[var(--primary)]/15 text-[var(--green-light)]" : status === "pending" ? "bg-amber-500/10 text-amber-300" : status === "refunded" ? "bg-sky-500/10 text-sky-300" : "bg-red-950/60 text-red-200";
  return <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${classes}`}>{status}</span>;
}
