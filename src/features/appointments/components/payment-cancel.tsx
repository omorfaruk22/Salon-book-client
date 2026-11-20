"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CircleX, LoaderCircle } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import type { ApiEnvelope } from "@/types/service";
import type { SalonAppointment } from "@/types/appointment";
import { AppointmentPaymentAction } from "@/features/appointments/components/appointment-payment-action";

export function PaymentCancel({ appointmentId }: { appointmentId: string }) {
  const [appointment, setAppointment] = useState<SalonAppointment | null>(null);
  const [loading, setLoading] = useState(Boolean(appointmentId));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!appointmentId || !/^[a-f\d]{24}$/i.test(appointmentId)) { setLoading(false); return; }
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await apiFetch(`/appointments/my-appointments/${encodeURIComponent(appointmentId)}`, { signal: controller.signal, cache: "no-store" });
        const result = await response.json().catch(() => null) as ApiEnvelope<SalonAppointment> | null;
        if (!response.ok || !result?.data) throw new Error(result?.error?.message ?? "Could not load the appointment.");
        if (!controller.signal.aborted) setAppointment(result.data);
      } catch (cause) { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load the appointment."); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    })();
    return () => controller.abort();
  }, [appointmentId]);

  const canRetry = appointment?.status === "confirmed" && appointment.paymentStatus !== "paid";
  return <main className="mx-auto max-w-3xl px-5 py-16 sm:px-7"><section className="rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-10"><CircleX className="size-12 text-amber-300" aria-hidden="true" /><p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-amber-300">Checkout cancelled</p><h1 className="mt-2 text-3xl font-bold">No payment was submitted.</h1><p className="mt-3 leading-6 text-[var(--muted)]">You left Stripe Checkout before completing payment. The appointment was not cancelled.</p>
    {loading && <p className="mt-5 inline-flex items-center gap-2 text-sm text-[var(--muted)]"><LoaderCircle className="size-4 animate-spin" />Checking appointment status…</p>}
    {error && <p role="alert" className="mt-5 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">{error}</p>}
    {appointment && <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"><p className="font-semibold">{appointment.serviceSnapshot.name}</p><p className="mt-1 text-sm text-[var(--muted)]">Appointment status: {appointment.status} · Payment: {appointment.paymentStatus ?? "unpaid"}</p>{canRetry && <div className="mt-4"><AppointmentPaymentAction appointmentId={appointment._id} /></div>}</div>}
    <div className="mt-6 flex flex-wrap gap-3"><Link href="/dashboard/my-appointments" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] px-5 text-sm font-medium hover:border-[var(--green-light)]">My appointments</Link><Link href="/transactions" className="inline-flex min-h-11 items-center px-4 text-sm text-[var(--green-light)] hover:underline">Payment history</Link></div>
  </section></main>;
}
