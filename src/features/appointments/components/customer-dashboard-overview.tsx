"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, CalendarCheck2, CalendarClock, CalendarX2, CalendarDays } from "lucide-react";
import { AppointmentServiceImage } from "@/features/appointments/components/appointment-service-image";
import { AppointmentPaymentAction } from "@/features/appointments/components/appointment-payment-action";
import { StatusPill } from "@/features/appointments/components/customer-appointments";
import { useAuth } from "@/components/providers/auth-provider";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { apiFetch } from "@/lib/api-client";
import { APPOINTMENTS_CHANGED_EVENT } from "@/lib/appointment-events";
import { formatBDTPrice, formatSalonAppointmentTime } from "@/lib/service-format";
import type { SalonAppointment } from "@/types/appointment";
import type { ApiEnvelope } from "@/types/service";

type AppointmentStats = { totalAppointments: number; pendingAppointments: number; confirmedAppointments: number; cancelledAppointments: number };
const emptyStats: AppointmentStats = { totalAppointments: 0, pendingAppointments: 0, confirmedAppointments: 0, cancelledAppointments: 0 };

export function CustomerDashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AppointmentStats>(emptyStats);
  const [appointments, setAppointments] = useState<SalonAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessNotice, setAccessNotice] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsResponse, appointmentsResponse] = await Promise.all([
        apiFetch("/appointments/my-stats", { cache: "no-store" }),
        apiFetch("/appointments/my-appointments?limit=4&sort=newest", { cache: "no-store" }),
      ]);
      const [statsResult, appointmentsResult] = await Promise.all([
        statsResponse.json().catch(() => null) as Promise<ApiEnvelope<AppointmentStats> | null>,
        appointmentsResponse.json().catch(() => null) as Promise<ApiEnvelope<SalonAppointment[]> | null>,
      ]);
      if (!statsResponse.ok || !statsResult?.data) throw new Error(statsResult?.error?.message ?? "Could not load your appointment summary.");
      if (!appointmentsResponse.ok || !appointmentsResult?.data) throw new Error(appointmentsResult?.error?.message ?? "Could not load your recent appointments.");
      setStats(statsResult.data);
      setAppointments(appointmentsResult.data);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load your dashboard.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    setAccessNotice(new URLSearchParams(window.location.search).get("notice") === "admin-only");
    void load();
    const refresh = () => void load();
    window.addEventListener(APPOINTMENTS_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(APPOINTMENTS_CHANGED_EVENT, refresh);
  }, [load]);

  const metricCards = [
    { label: "Total appointments", value: stats.totalAppointments, Icon: CalendarDays, tone: "text-[var(--foreground)]" },
    { label: "Pending", value: stats.pendingAppointments, Icon: CalendarClock, tone: "text-amber-300" },
    { label: "Confirmed", value: stats.confirmedAppointments, Icon: CalendarCheck2, tone: "text-[var(--green-light)]" },
    { label: "Cancelled", value: stats.cancelledAppointments, Icon: CalendarX2, tone: "text-red-300" },
  ];

  return <div className="mx-auto max-w-7xl space-y-9">
    {accessNotice && <p role="status" className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">Admin access is restricted to administrator accounts. You are viewing your customer dashboard.</p>}
    <section className="flex flex-col gap-5 rounded-3xl border border-[var(--border)] bg-[radial-gradient(circle_at_92%_4%,rgb(22_163_74_/_16%),transparent_35%),var(--surface)] p-6 sm:flex-row sm:items-end sm:justify-between sm:p-8">
      <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-[var(--green-light)]">Customer dashboard</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Welcome back{user?.name ? `, ${user.name.split(/\s+/)[0]}` : ""}!</h1><p className="mt-3 max-w-2xl leading-6 text-[var(--muted)]">Manage your salon appointments and keep track of your bookings.</p></div>
      <Link href="/services" className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-5 font-semibold text-white transition hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)]">Book new appointment<ArrowRight className="size-4" aria-hidden="true" /></Link>
    </section>

    {error && <div className="space-y-3"><ErrorState title="Dashboard could not load" description={error} onRetry={() => void load()} />{error.toLowerCase().includes("session") && <Link href={`/sign-in?next=${encodeURIComponent("/dashboard")}`} className="inline-flex min-h-10 items-center text-sm text-[var(--green-light)] underline">Sign in again</Link>}</div>}

    <section aria-labelledby="appointment-stats-title"><div className="mb-4"><p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--green-light)]">Your activity</p><h2 id="appointment-stats-title" className="mt-1 text-xl font-semibold">Appointment overview</h2></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metricCards.map(({ label, value, Icon, tone }) => <article key={label} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"><div className="flex items-center justify-between gap-3"><p className="text-sm text-[var(--muted)]">{label}</p><Icon className={`size-5 ${tone}`} aria-hidden="true" /></div>{loading ? <Skeleton className="mt-5 h-9 w-20" /> : <p className={`mt-4 text-3xl font-semibold ${tone}`}>{value}</p>}</article>)}</div>
    </section>

    <section aria-labelledby="recent-appointments-title">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--green-light)]">Latest bookings</p><h2 id="recent-appointments-title" className="mt-1 text-xl font-semibold">Recent appointments</h2></div><Link href="/dashboard/my-appointments" className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[var(--green-light)] hover:underline">View all appointments<ArrowRight className="size-4" aria-hidden="true" /></Link></div>
      {loading ? <div className="grid gap-3">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-32 rounded-2xl" />)}</div>
        : appointments.length ? <div className="grid gap-3">{appointments.map((appointment) => <article key={appointment._id} className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:flex-row sm:items-center sm:p-5">
          <AppointmentServiceImage imageUrl={appointment.serviceSnapshot.imageUrl} name={appointment.serviceSnapshot.name} className="h-24 w-full shrink-0 rounded-xl sm:w-32" />
          <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-semibold">{appointment.serviceSnapshot.name}</h3><StatusPill status={appointment.status} /></div><p className="mt-1 text-sm text-[var(--muted)]">{formatSalonAppointmentTime(appointment.appointmentDate, appointment.timeSlot, appointment.startsAt)} · {formatBDTPrice(appointment.serviceSnapshot.price)}</p><p className="mt-1 text-xs text-[var(--muted)]">Payment: <span className={appointment.paymentStatus === "paid" ? "text-[var(--green-light)]" : "text-amber-300"}>{(appointment.paymentStatus ?? "unpaid").toUpperCase()}</span></p></div>
          <div className="flex shrink-0 flex-wrap gap-2"><Link href={`/dashboard/my-appointments/${appointment._id}`} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--green-light)]/60 hover:text-white">View details</Link>{appointment.status === "confirmed" && appointment.paymentStatus !== "paid" && <AppointmentPaymentAction appointmentId={appointment._id} compact />}</div>
        </article>)}</div>
          : <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-8 text-center sm:p-12"><p className="text-lg font-semibold">No appointments yet</p><p className="mt-2 text-sm text-[var(--muted)]">Browse our services and book your first salon visit.</p><Link href="/services" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]">Browse services</Link></div>}
    </section>
  </div>;
}
