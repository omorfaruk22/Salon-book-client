"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import type { ApiEnvelope } from "@/types/service";
import type { SalonAppointment } from "@/types/appointment";
import type { SalonTransaction } from "@/types/appointment";

const currency = new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 });

export function CustomerAppointments() {
  const [appointments, setAppointments] = useState<SalonAppointment[]>([]);
  const [transactions, setTransactions] = useState<SalonTransaction[]>([]);
  const [payingId, setPayingId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [response, transactionResponse] = await Promise.all([apiFetch("/appointments"), apiFetch("/transactions")]);
      const result = (await response.json()) as ApiEnvelope<SalonAppointment[]>;
      const transactionResult = (await transactionResponse.json()) as ApiEnvelope<SalonTransaction[]>;
      if (!response.ok) throw new Error(result.error?.message ?? "Could not load appointments.");
      if (!transactionResponse.ok) throw new Error(transactionResult.error?.message ?? "Could not load payment records.");
      setAppointments(result.data); setTransactions(transactionResult.data); setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Please sign in to view appointments."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function cancel(id: string) {
    setError(""); setNotice("");
    try {
      const response = await apiFetch(`/appointments/${id}/cancel`, { method: "PATCH" });
      const result = (await response.json()) as ApiEnvelope<SalonAppointment>;
      if (!response.ok) throw new Error(result.error?.message ?? "Could not cancel appointment.");
      setNotice("Appointment request cancelled."); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not cancel appointment."); }
  }

  async function pay(appointmentId: string) {
    setPayingId(appointmentId); setError("");
    try {
      const response = await apiFetch("/transactions/checkout-session", { method: "POST", body: JSON.stringify({ appointmentId }) });
      const result = (await response.json()) as ApiEnvelope<{ url?: string; paid?: boolean }>;
      if (!response.ok) throw new Error(result.error?.message ?? "Could not start checkout.");
      if (result.data.paid) {
        setNotice("Payment confirmed by Stripe.");
        await load();
        setPayingId("");
        return;
      }
      if (!result.data.url) throw new Error("Stripe did not return a checkout link.");
      window.location.assign(result.data.url);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not start checkout."); setPayingId(""); }
  }

  return <div className="mt-8 space-y-4">
    {error && <p role="alert" className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">{error}</p>}
    {notice && <p role="status" className="rounded-xl border border-[var(--primary)]/40 bg-[var(--primary)]/10 p-4 text-sm text-[var(--green-soft)]">{notice}</p>}
    {loading ? <p className="py-12 text-center text-[var(--muted)]">Loading appointments…</p> : appointments.length ? appointments.map((appointment) => <article key={appointment._id} className="flex flex-col gap-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:flex-row sm:items-center sm:justify-between">
      <div><div className="flex flex-wrap items-center gap-3"><h2 className="text-lg font-semibold">{appointment.serviceSnapshot.name}</h2><StatusPill status={appointment.status} /></div><p className="mt-2 text-sm text-[var(--muted)]">{new Date(appointment.startsAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</p><p className="mt-1 text-sm text-[var(--muted)]">{appointment.serviceSnapshot.durationMinutes} min · {currency.format(appointment.serviceSnapshot.price)}</p>{appointment.customerNote && <p className="mt-3 max-w-2xl text-sm text-[var(--muted)]">Note: {appointment.customerNote}</p>}</div>
      {appointment.status === "confirmed" && (transactions.some((transaction) => transaction.appointmentId === appointment._id && transaction.status === "paid") ? <span className="rounded-xl border border-[var(--primary)]/50 px-4 py-2 text-sm font-medium text-[var(--green-light)]">Paid</span> : <button disabled={payingId === appointment._id} onClick={() => void pay(appointment._id)} className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold hover:bg-[var(--primary-hover)] disabled:opacity-60">{payingId === appointment._id ? "Opening checkout…" : "Pay now"}</button>)}
      {appointment.status === "pending" && <button onClick={() => void cancel(appointment._id)} className="rounded-xl border border-red-900/70 px-4 py-2 text-sm text-red-200 hover:bg-red-950/40">Cancel request</button>}
    </article>) : !error && <p className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center text-[var(--muted)]">No appointments yet. Explore salon services to make a request.</p>}
  </div>;
}

export function StatusPill({ status }: { status: string }) {
  const classes = status === "confirmed" ? "bg-[var(--primary)]/15 text-[var(--green-light)]" : status === "pending" ? "bg-amber-500/10 text-amber-300" : status === "completed" ? "bg-sky-500/10 text-sky-300" : "bg-slate-700/60 text-[var(--muted)]";
  return <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${classes}`}>{status}</span>;
}
