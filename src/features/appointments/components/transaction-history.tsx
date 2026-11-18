"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import type { ApiEnvelope } from "@/types/service";
import type { SalonTransaction } from "@/types/appointment";

const money = new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 });

export function TransactionHistory({ admin = false }: { admin?: boolean }) {
  const [items, setItems] = useState<SalonTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingSuccess, setPendingSuccess] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const load = useCallback(async () => {
    try {
      const response = await apiFetch("/transactions");
      const result = (await response.json()) as ApiEnvelope<SalonTransaction[]>;
      if (!response.ok) throw new Error(result.error?.message ?? "Could not load transactions.");
      setItems(result.data); setError("");
      setPendingSuccess(result.data.some((item) => item.status === "pending"));
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load transactions."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => {
    setCheckoutSuccess(new URLSearchParams(window.location.search).get("checkout") === "success");
    void load();
  }, [load]);
  useEffect(() => {
    if (!checkoutSuccess) return;
    const timer = window.setTimeout(() => void load(), 2500);
    return () => window.clearTimeout(timer);
  }, [checkoutSuccess, load]);

  return <div className="mt-8 space-y-5">
    {checkoutSuccess && <p role="status" className="rounded-xl border border-[var(--primary)]/40 bg-[var(--primary)]/10 p-4 text-sm text-[var(--green-soft)]">Checkout completed. Payment status is verified by Stripe and will update here shortly.</p>}
    {checkoutSuccess && pendingSuccess && <p className="text-xs text-[var(--muted)]">Waiting for Stripe confirmation. Refresh this page in a moment.</p>}
    {error && <p role="alert" className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">{error}</p>}
    {loading ? <p className="py-12 text-center text-[var(--muted)]">Loading transactions…</p> : items.length ? <div className="overflow-x-auto rounded-2xl border border-[var(--border)]"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-[var(--surface)] text-[var(--muted)]"><tr><th className="px-5 py-4 font-medium">Service</th>{admin && <th className="px-5 py-4 font-medium">Customer</th>}<th className="px-5 py-4 font-medium">Amount</th><th className="px-5 py-4 font-medium">Status</th><th className="px-5 py-4 font-medium">Date</th></tr></thead><tbody>{items.map((item) => <tr key={item._id} className="border-t border-[var(--border)]"><td className="px-5 py-4"><p className="font-medium">{item.serviceName}</p><p className="mt-1 text-xs text-[var(--muted)]">Ref {item._id.slice(-8).toUpperCase()}</p></td>{admin && <td className="px-5 py-4"><span className="text-xs text-[var(--muted)]">{item.customerId}</span></td>}<td className="px-5 py-4 font-medium">{money.format(item.amount)}</td><td className="px-5 py-4"><TransactionStatus status={item.status} /></td><td className="px-5 py-4 text-[var(--muted)]">{new Date(item.paidAt ?? item.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</td></tr>)}</tbody></table></div> : !error && <div className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center"><h2 className="text-lg font-semibold">No payment records</h2><p className="mt-2 text-sm text-[var(--muted)]">{admin ? "Customer payments will appear here." : "Confirmed appointments can be paid from your appointment list."}</p><Link href={admin ? "/admin/appointments" : "/appointments"} className="mt-4 inline-flex text-sm text-[var(--green-light)] hover:underline">{admin ? "Review appointments" : "View appointments"}</Link></div>}
  </div>;
}

function TransactionStatus({ status }: { status: string }) {
  const classes = status === "paid" ? "bg-[var(--primary)]/15 text-[var(--green-light)]" : status === "pending" ? "bg-amber-500/10 text-amber-300" : status === "refunded" ? "bg-sky-500/10 text-sky-300" : "bg-red-950/60 text-red-200";
  return <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${classes}`}>{status}</span>;
}
