"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import type { ApiEnvelope } from "@/types/service";
import type { AppointmentStatus, SalonAppointment } from "@/types/appointment";
import { StatusPill } from "./customer-appointments";

const currency = new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 });

export function AdminAppointments() {
  const [items, setItems] = useState<SalonAppointment[]>([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiFetch(`/appointments/admin${filter === "all" ? "" : `?status=${filter}`}`);
      const result = (await response.json()) as ApiEnvelope<SalonAppointment[]>;
      if (!response.ok) throw new Error(result.error?.message ?? "Could not load appointment requests.");
      setItems(result.data); setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load appointment requests."); }
    finally { setLoading(false); }
  }, [filter]);
  useEffect(() => { void load(); }, [load]);

  async function change(id: string, action: "confirm" | "cancel" | "complete") {
    setError(""); setNotice("");
    try {
      const response = action === "confirm"
        ? await apiFetch(`/appointments/${id}/confirm`, { method: "PATCH" })
        : await apiFetch(`/appointments/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: action === "cancel" ? "cancelled" : "completed" }) });
      const result = (await response.json()) as ApiEnvelope<SalonAppointment>;
      if (!response.ok) throw new Error(result.error?.message ?? "Could not update appointment.");
      const messages: Record<typeof action, string> = { confirm: "Appointment confirmed.", cancel: "Appointment cancelled.", complete: "Appointment marked complete." };
      setNotice(messages[action]); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update appointment."); }
  }

  return <div className="mt-8 space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-[var(--muted)]">Review requests and keep appointment status up to date.</p><label className="flex items-center gap-3 text-sm text-[var(--muted)]">Status<select value={filter} onChange={(event) => setFilter(event.target.value)} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[var(--foreground)]"><option value="all">All statuses</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option><option value="completed">Completed</option></select></label></div>
    {error && <p role="alert" className="rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">{error}</p>}
    {notice && <p role="status" className="rounded-xl border border-[var(--primary)]/40 bg-[var(--primary)]/10 p-4 text-sm text-[var(--green-soft)]">{notice}</p>}
    {loading ? <p className="py-12 text-center text-[var(--muted)]">Loading appointment requests…</p> : items.length ? <div className="space-y-4">{items.map((appointment) => <article key={appointment._id} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-3"><h2 className="text-lg font-semibold">{appointment.serviceSnapshot.name}</h2><StatusPill status={appointment.status} /></div><p className="mt-2 text-sm text-[var(--muted)]">{new Date(appointment.startsAt).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" })}</p><p className="mt-1 text-sm text-[var(--muted)]">{appointment.serviceSnapshot.durationMinutes} min · {currency.format(appointment.serviceSnapshot.price)}</p><p className="mt-2 break-all text-xs text-[var(--muted)]">Customer ID: {appointment.customerId}</p>{appointment.customerNote && <p className="mt-3 rounded-xl bg-[var(--surface)] p-3 text-sm text-[var(--muted)]">{appointment.customerNote}</p>}</div>
        <div className="flex shrink-0 flex-wrap gap-2">{appointment.status === "pending" && <button onClick={() => void change(appointment._id, "confirm")} className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold hover:bg-[var(--primary-hover)]">Confirm</button>}{["pending", "confirmed"].includes(appointment.status) && <button onClick={() => void change(appointment._id, "cancel")} className="rounded-xl border border-red-900/70 px-4 py-2 text-sm text-red-200 hover:bg-red-950/40">Cancel</button>}{appointment.status === "confirmed" && <button onClick={() => void change(appointment._id, "complete")} className="rounded-xl border border-[var(--border)] px-4 py-2 text-sm hover:border-[var(--green-light)]">Complete</button>}</div>
      </div>
    </article>)}</div> : !error && <p className="rounded-2xl border border-dashed border-[var(--border)] p-12 text-center text-[var(--muted)]">No appointments match this filter.</p>}
  </div>;
}
