"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Printer, ReceiptText } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import type { SalonTransaction } from "@/types/appointment";
import type { ApiEnvelope } from "@/types/service";
import { TransactionStatus } from "@/features/appointments/components/transaction-history";

export function TransactionReceipt({ transactionId }: { transactionId: string }) {
  const [transaction, setTransaction] = useState<SalonTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await apiFetch(`/transactions/${encodeURIComponent(transactionId)}`, { signal: controller.signal, cache: "no-store" });
        const result = await response.json().catch(() => null) as ApiEnvelope<SalonTransaction> | null;
        if (!response.ok || !result?.data) throw new Error(result?.error?.message ?? "Could not load this receipt.");
        if (!controller.signal.aborted) { setTransaction(result.data); setError(""); }
      } catch (cause) { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load this receipt."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    })();
    return () => controller.abort();
  }, [transactionId]);

  if (loading) return <p className="py-16 text-center text-[var(--muted)]">Loading receipt…</p>;
  if (error || !transaction) return <div className="mx-auto max-w-2xl space-y-4"><p role="alert" className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">{error || "Receipt not found."}</p><Link href="/transactions" className="inline-flex items-center gap-2 text-sm text-[var(--green-light)]"><ArrowLeft className="size-4" />Payment history</Link></div>;

  const paidDate = transaction.paidAt ? new Date(transaction.paidAt) : null;
  const createdDate = new Date(transaction.createdAt);
  const fmtDate = (value: Date) => value.toLocaleString("en-BD", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Dhaka" });
  return <div className="mx-auto max-w-3xl space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3 print:hidden"><Link href="/transactions" className="inline-flex min-h-10 items-center gap-2 text-sm text-[var(--muted)] hover:text-white"><ArrowLeft className="size-4" />Back to payments</Link><button type="button" onClick={() => window.print()} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-4 text-sm font-medium hover:border-[var(--green-light)]"><Printer className="size-4" />Print / Save PDF</button></div>
    <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)] print:border-slate-300 print:bg-white print:text-black">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-[var(--border)] p-6 sm:p-8 print:border-slate-200"><div><p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.18em] text-[var(--green-light)] print:text-green-700"><ReceiptText className="size-4" />SalonBook receipt</p><h1 className="mt-3 text-2xl font-bold sm:text-3xl">Payment receipt</h1><p className="mt-2 text-sm text-[var(--muted)] print:text-slate-600">Reference {transaction._id.toUpperCase()}</p></div><TransactionStatus status={transaction.status} /></header>
      <div className="grid gap-6 p-6 sm:grid-cols-2 sm:p-8"><ReceiptField label="Service" value={transaction.serviceName} /><ReceiptField label="Amount" value={new Intl.NumberFormat("en-BD", { style: "currency", currency: transaction.currency.toUpperCase() }).format(transaction.amount)} /><ReceiptField label="Appointment reference" value={transaction.appointmentId.toUpperCase()} mono /><ReceiptField label="Payment method" value={transaction.paymentMethod ?? "Card via Stripe"} /><ReceiptField label="Payment date" value={paidDate ? fmtDate(paidDate) : "Not paid yet"} /><ReceiptField label="Transaction created" value={fmtDate(createdDate)} /></div>
      <footer className="border-t border-[var(--border)] bg-[var(--card)]/60 px-6 py-4 text-xs leading-5 text-[var(--muted)] print:border-slate-200 print:bg-white print:text-slate-600">This receipt reflects SalonBook’s verified payment record. Stripe Checkout session details and card data are not included.</footer>
    </article>
  </div>;
}

function ReceiptField({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className="min-w-0"><p className="text-xs uppercase tracking-wider text-[var(--muted)] print:text-slate-500">{label}</p><p className={`mt-2 break-words font-medium print:text-black ${mono ? "font-mono text-xs" : "text-sm"}`}>{value}</p></div>;
}
