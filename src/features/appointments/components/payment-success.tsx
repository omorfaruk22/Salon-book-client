"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BadgeCheck, CircleAlert, Clock3, ReceiptText, RefreshCw, UserRound } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import type { SalonTransaction } from "@/types/appointment";
import type { ApiEnvelope } from "@/types/service";
import { formatBDTPrice } from "@/lib/service-format";
import { TransactionStatus } from "@/features/appointments/components/transaction-history";

type Verification = { transaction: SalonTransaction; paymentVerified: boolean; stripeCheckoutStatus: string | null; stripePaymentStatus: string };

export function PaymentSuccess({ sessionId }: { sessionId: string }) {
  const [data, setData] = useState<Verification | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!sessionId) { setLoading(false); setError("Stripe did not return a checkout session reference."); return; }
    const controller = new AbortController();
    let active = true;
    void (async () => {
      setLoading(true); setError("");
      try {
        for (let attempt = 0; attempt < 10 && !controller.signal.aborted; attempt += 1) {
          const response = await apiFetch(`/transactions/verify/${encodeURIComponent(sessionId)}`, { signal: controller.signal, cache: "no-store" });
          const result = await response.json().catch(() => null) as ApiEnvelope<Verification> | null;
          if (!response.ok || !result?.data) throw new Error(result?.error?.message ?? "Could not verify the Stripe payment.");
          if (!active) return;
          setData(result.data);
          if (result.data.paymentVerified || result.data.transaction.status === "failed") return;
          if (attempt < 9) await new Promise<void>((resolve) => window.setTimeout(resolve, 2200));
        }
      } catch (cause) { if (active && !controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not verify the Stripe payment."); }
      finally { if (active) setLoading(false); }
    })();
    return () => { active = false; controller.abort(); };
  }, [sessionId, retry]);

  const verified = data?.paymentVerified;
  return <main className="mx-auto max-w-3xl px-5 py-16 sm:px-7">
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-10">
      {verified ? <><BadgeCheck className="size-12 text-[var(--green-light)]" aria-hidden="true" /><p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-[var(--green-light)]">Payment verified</p><h1 className="mt-2 text-3xl font-bold">Thank you. Your payment is complete.</h1><p className="mt-3 leading-6 text-[var(--muted)]">Stripe confirmed this payment and SalonBook has recorded it.</p><div className="mt-7 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"><div><p className="font-semibold">{data.transaction.serviceName}</p><p className="mt-1 text-sm text-[var(--muted)]">{formatBDTPrice(data.transaction.amount)} · Ref {data.transaction._id.slice(-8).toUpperCase()}</p></div><TransactionStatus status={data.transaction.status} /></div><div className="mt-6 flex flex-wrap gap-3"><Link href={`/transactions/${data.transaction._id}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-white hover:bg-[var(--primary-hover)]"><ReceiptText className="size-4" />View receipt</Link><Link href="/transactions" className="inline-flex min-h-11 items-center rounded-xl border border-[var(--border)] px-5 text-sm font-medium hover:border-[var(--green-light)]">Payment history</Link><Link href="/dashboard/profile" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] px-5 text-sm font-medium hover:border-[var(--green-light)]"><UserRound className="size-4" aria-hidden="true" />My profile</Link></div></>
        : data?.transaction.status === "failed" ? <><CircleAlert className="size-12 text-red-300" aria-hidden="true" /><p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-red-300">Payment not completed</p><h1 className="mt-2 text-3xl font-bold">This Checkout did not complete.</h1><p className="mt-3 text-[var(--muted)]">No successful payment was recorded for this attempt.</p><Link href="/dashboard/my-appointments" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-white">Return to appointments</Link></>
          : <><Clock3 className="size-12 text-amber-300" aria-hidden="true" /><p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-amber-300">{loading ? "Checking payment" : "Verification pending"}</p><h1 className="mt-2 text-3xl font-bold">{loading ? "Confirming your payment…" : "Stripe is still confirming this payment."}</h1><p className="mt-3 leading-6 text-[var(--muted)]">Your browser returning from Checkout is not proof of payment. SalonBook will show paid only after Stripe’s signed webhook updates the record. Please wait or check again shortly.</p>{error && <p role="alert" className="mt-4 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">{error}</p>}<div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={() => setRetry((value) => value + 1)} disabled={loading} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] px-5 text-sm font-semibold hover:border-[var(--green-light)] disabled:opacity-50"><RefreshCw className="size-4" />Check again</button><Link href="/transactions" className="inline-flex min-h-11 items-center rounded-xl px-4 text-sm text-[var(--green-light)] hover:underline">Payment history</Link></div></>}
    </section>
  </main>;
}
