"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, Clock3, Hash, Wallet } from "lucide-react";
import { AppointmentServiceImage } from "@/features/appointments/components/appointment-service-image";
import { AppointmentPaymentAction } from "@/features/appointments/components/appointment-payment-action";
import { StatusPill } from "@/features/appointments/components/customer-appointments";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { formatBDTPrice, formatSalonAppointmentTime, formatServiceDuration } from "@/lib/service-format";
import type { SalonAppointment } from "@/types/appointment";
import type { ApiEnvelope } from "@/types/service";

export function MyAppointmentDetails({ appointmentId }: { appointmentId: string }) {
  const [appointment, setAppointment] = useState<SalonAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      try {
        const response = await apiFetch(`/appointments/my-appointments/${encodeURIComponent(appointmentId)}`, { signal: controller.signal, cache: "no-store" });
        const result = await response.json().catch(() => null) as ApiEnvelope<SalonAppointment> | null;
        if (!response.ok || !result?.data) throw new Error(result?.error?.message ?? "Could not load this appointment.");
        if (!controller.signal.aborted) { setAppointment(result.data); setError(""); }
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load this appointment.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    void load();
    return () => controller.abort();
  }, [appointmentId]);

  if (loading) return <div className="mx-auto max-w-4xl space-y-5"><Skeleton className="h-8 w-52" /><Skeleton className="h-72 rounded-3xl" /><Skeleton className="h-48 rounded-3xl" /></div>;
  if (error || !appointment) return <div className="mx-auto max-w-3xl space-y-4"><ErrorState title="Appointment details unavailable" description={error || "We could not find this appointment."} />{error.toLowerCase().includes("session") && <Link href={`/sign-in?next=${encodeURIComponent(`/dashboard/my-appointments/${appointmentId}`)}`} className="inline-flex min-h-10 items-center text-sm text-[var(--green-light)] underline">Sign in again</Link>}<Link href="/dashboard/my-appointments" className="inline-flex min-h-10 items-center text-sm text-[var(--green-light)] hover:underline"><ArrowLeft className="mr-2 size-4" />Back to appointments</Link></div>;

  const paymentStatus = appointment.paymentStatus ?? "unpaid";
  return <div className="mx-auto max-w-4xl space-y-6">
    <Link href="/dashboard/my-appointments" className="inline-flex min-h-10 items-center gap-2 text-sm text-[var(--muted)] transition hover:text-white"><ArrowLeft className="size-4" aria-hidden="true" />Back to appointments</Link>
    <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <AppointmentServiceImage imageUrl={appointment.serviceSnapshot.imageUrl} name={appointment.serviceSnapshot.name} className="h-60 w-full md:h-full md:min-h-80" />
        <div className="p-5 sm:p-8"><div className="flex flex-wrap items-center gap-2"><StatusPill status={appointment.status} /><span className={`rounded-full px-3 py-1 text-xs font-medium ${paymentStatus === "paid" ? "bg-[var(--primary)]/15 text-[var(--green-light)]" : "bg-amber-500/10 text-amber-300"}`}>{paymentStatus.toUpperCase()}</span></div><p className="mt-5 text-xs font-semibold uppercase tracking-[.16em] text-[var(--green-light)]">{appointment.serviceSnapshot.category ?? "Salon service"}</p><h1 className="mt-2 text-3xl font-bold tracking-tight">{appointment.serviceSnapshot.name}</h1><p className="mt-3 leading-7 text-[var(--muted)]">{appointment.serviceSnapshot.description ?? "Service information is no longer available."}</p><p className="mt-5 text-2xl font-semibold">{formatBDTPrice(appointment.serviceSnapshot.price)}</p></div>
      </div>
      <div className="border-t border-[var(--border)] p-5 sm:p-8">
        <h2 className="text-lg font-semibold">Booking details</h2>
        <dl className="mt-5 grid gap-5 sm:grid-cols-2">
          <DetailItem Icon={Hash} label="Appointment reference" value={appointment._id} mono />
          <DetailItem Icon={CalendarDays} label="Appointment date and time" value={formatSalonAppointmentTime(appointment.appointmentDate, appointment.timeSlot, appointment.startsAt)} />
          <DetailItem Icon={Clock3} label="Service duration" value={formatServiceDuration(appointment.serviceSnapshot.durationMinutes)} />
          <DetailItem Icon={Wallet} label="Service price" value={formatBDTPrice(appointment.serviceSnapshot.price)} />
          <DetailItem Icon={CalendarDays} label="Booked on" value={new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short" }).format(new Date(appointment.createdAt))} />
          <DetailItem Icon={Wallet} label="Payment status" value={paymentStatus.toUpperCase()} />
        </dl>
        {appointment.customerNote && <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"><p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Your message</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{appointment.customerNote}</p></div>}
        {appointment.status === "confirmed" && paymentStatus === "unpaid" && <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"><h2 className="font-semibold">Complete your payment</h2><p className="mt-1 mb-4 text-sm text-[var(--muted)]">Payment is available after the salon confirms your appointment.</p><AppointmentPaymentAction appointmentId={appointment._id} /></div>}
      </div>
    </article>
  </div>;
}

function DetailItem({ Icon, label, value, mono = false }: { Icon: typeof Hash; label: string; value: string; mono?: boolean }) {
  return <div className="flex min-w-0 gap-3"><Icon className="mt-0.5 size-4 shrink-0 text-[var(--green-light)]" aria-hidden="true" /><div className="min-w-0"><dt className="text-xs text-[var(--muted)]">{label}</dt><dd className={`mt-1 break-words font-medium ${mono ? "font-mono text-xs" : "text-sm"}`}>{value}</dd></div></div>;
}
