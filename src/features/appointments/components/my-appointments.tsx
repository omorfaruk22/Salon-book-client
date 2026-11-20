"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { AppointmentServiceImage } from "@/features/appointments/components/appointment-service-image";
import { AppointmentPaymentAction } from "@/features/appointments/components/appointment-payment-action";
import { StatusPill } from "@/features/appointments/components/customer-appointments";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/providers/toast-provider";
import { apiFetch } from "@/lib/api-client";
import { notifyAppointmentsChanged } from "@/lib/appointment-events";
import { formatBDTPrice, formatSalonAppointmentTime } from "@/lib/service-format";
import type { SalonAppointment } from "@/types/appointment";
import type { ApiEnvelope } from "@/types/service";

type AppointmentFilter = "all" | "pending" | "confirmed" | "cancelled";
type AppointmentListMeta = { page: number; limit: number; total: number; totalPages: number };
const filters: { value: AppointmentFilter; label: string }[] = [
  { value: "all", label: "All appointments" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "cancelled", label: "Cancelled" },
];

export function MyAppointments() {
  const toast = useToast();
  const [status, setStatus] = useState<AppointmentFilter>("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [page, setPage] = useState(1);
  const [appointments, setAppointments] = useState<SalonAppointment[]>([]);
  const [meta, setMeta] = useState<AppointmentListMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [cancelTarget, setCancelTarget] = useState<SalonAppointment | null>(null);
  const [cancellingId, setCancellingId] = useState("");

  const load = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ page: String(page), limit: "10", sort });
      if (status !== "all") query.set("status", status);
      if (search.trim()) query.set("search", search.trim());
      const response = await apiFetch(`/appointments/my-appointments?${query.toString()}`, { signal, cache: "no-store" });
      const result = await response.json().catch(() => null) as (ApiEnvelope<SalonAppointment[]> & { meta?: AppointmentListMeta }) | null;
      if (!response.ok || !result?.data) throw new Error(result?.error?.message ?? "Could not load your appointments.");
      if (signal.aborted) return;
      setAppointments(result.data);
      setMeta(result.meta ?? { page, limit: 10, total: result.data.length, totalPages: 1 });
      setError("");
    } catch (cause) {
      if (signal.aborted) return;
      setError(cause instanceof Error ? cause.message : "Could not load your appointments.");
      setAppointments([]);
    } finally { if (!signal.aborted) setLoading(false); }
  }, [page, search, sort, status]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => void load(controller.signal), 220);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [load, retry]);

  useEffect(() => {
    let lastRefreshAt = 0;
    const refreshWhenVisible = () => {
      if (document.visibilityState !== "visible" || Date.now() - lastRefreshAt < 1000) return;
      lastRefreshAt = Date.now();
      setRetry((value) => value + 1);
    };
    window.addEventListener("focus", refreshWhenVisible);
    document.addEventListener("visibilitychange", refreshWhenVisible);
    return () => {
      window.removeEventListener("focus", refreshWhenVisible);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  async function cancelAppointment() {
    if (!cancelTarget || cancellingId) return;
    const id = cancelTarget._id;
    setCancellingId(id);
    try {
      const response = await apiFetch(`/appointments/${id}/cancel`, { method: "PATCH" });
      const result = await response.json().catch(() => null) as ApiEnvelope<SalonAppointment> | null;
      if (!response.ok || !result?.data) throw new Error(result?.error?.message ?? "Could not cancel this appointment.");
      setCancelTarget(null);
      toast("Appointment cancelled. Its time is available again.", "success");
      notifyAppointmentsChanged();
      setRetry((value) => value + 1);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not cancel this appointment.";
      toast(message, "error");
      setError(message);
      setCancelTarget(null);
    } finally { setCancellingId(""); }
  }

  const signInHref = `/sign-in?next=${encodeURIComponent("/dashboard/my-appointments")}`;
  const noMatches = !loading && !error && appointments.length === 0;

  return <div className="mx-auto max-w-7xl">
    <header className="mb-7"><p className="text-xs font-semibold uppercase tracking-[.18em] text-[var(--green-light)]">Your bookings</p><h1 className="mt-2 text-3xl font-bold tracking-tight">My appointments</h1><p className="mt-2 text-[var(--muted)]">Review your salon visits and manage pending requests.</p></header>

    <div className="space-y-5 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter appointments by status">{filters.map((filter) => <button key={filter.value} type="button" aria-pressed={status === filter.value} onClick={() => { setStatus(filter.value); setPage(1); }} className={`min-h-10 rounded-full border px-4 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)] ${status === filter.value ? "border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--green-light)]" : "border-[var(--border)] text-[var(--muted)] hover:text-white"}`}>{filter.label}</button>)}</div>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem]">
        <label className="relative block"><span className="sr-only">Search by service or appointment reference</span><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" aria-hidden="true" /><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search service or reference" className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] pl-10 pr-4 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--green-light)] focus:ring-2 focus:ring-[var(--green-light)]/25" /></label>
        <label className="flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--background)] px-3 text-sm"><span className="shrink-0 text-[var(--muted)]">Sort</span><select value={sort} onChange={(event) => { setSort(event.target.value as "newest" | "oldest"); setPage(1); }} className="min-w-0 flex-1 bg-transparent py-2 text-[var(--foreground)] outline-none"><option value="newest" className="bg-[var(--surface)]">Newest first</option><option value="oldest" className="bg-[var(--surface)]">Oldest first</option></select></label>
      </div>

      {error && <div className="space-y-3"><ErrorState title="Appointments could not load" description={error} onRetry={() => setRetry((value) => value + 1)} />{error.toLowerCase().includes("session") && <Link href={signInHref} className="inline-flex min-h-10 items-center text-sm text-[var(--green-light)] underline">Sign in again to continue</Link>}</div>}
      {loading ? <div className="space-y-3">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-36 rounded-2xl" />)}</div>
        : appointments.length ? <div className="space-y-3">{appointments.map((appointment) => <article key={appointment._id} className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:grid-cols-[8rem_minmax(0,1fr)_auto] sm:items-center sm:p-5">
          <AppointmentServiceImage imageUrl={appointment.serviceSnapshot.imageUrl} name={appointment.serviceSnapshot.name} className="h-24 w-full rounded-xl sm:h-24 sm:w-32" />
          <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate text-lg font-semibold">{appointment.serviceSnapshot.name}</h2><StatusPill status={appointment.status} /><PaymentPill status={appointment.paymentStatus ?? "unpaid"} /></div><p className="mt-2 text-sm text-[var(--muted)]">{formatSalonAppointmentTime(appointment.appointmentDate, appointment.timeSlot, appointment.startsAt)}</p><p className="mt-1 text-sm text-[var(--muted)]">{appointment.serviceSnapshot.durationMinutes} min · {formatBDTPrice(appointment.serviceSnapshot.price)}</p><p className="mt-1 truncate font-mono text-xs text-[var(--muted)]">Ref {appointment._id}</p></div>
          <div className="flex flex-wrap gap-2 sm:justify-end"><Link href={`/dashboard/my-appointments/${appointment._id}`} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--green-light)]/60">View details</Link>{appointment.status === "confirmed" && appointment.paymentStatus !== "paid" && <AppointmentPaymentAction appointmentId={appointment._id} compact />}{appointment.status === "pending" && <button type="button" disabled={Boolean(cancellingId)} onClick={() => setCancelTarget(appointment)} className="inline-flex min-h-10 items-center justify-center rounded-xl border border-red-900/70 px-4 text-sm font-medium text-red-200 transition hover:bg-red-950/40 disabled:opacity-60">Cancel</button>}</div>
        </article>)}</div>
          : noMatches ? <div className="rounded-2xl border border-dashed border-[var(--border)] px-5 py-12 text-center"><p className="text-lg font-semibold">{search.trim() || status !== "all" ? "No appointments match these filters" : "You have no appointments yet"}</p><p className="mt-2 text-sm text-[var(--muted)]">{search.trim() || status !== "all" ? "Try another search or select a different status." : "Choose a salon service to book your first visit."}</p><Link href="/services" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[var(--primary)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]">Browse services</Link></div> : null}

      {!loading && !error && meta.totalPages > 1 && <nav aria-label="Appointment pages" className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4"><p className="text-sm text-[var(--muted)]">Showing {appointments.length} of {meta.total} appointments · Page {meta.page} of {meta.totalPages}</p><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm disabled:opacity-40"><ArrowLeft className="size-4" aria-hidden="true" />Previous</button><button type="button" disabled={page >= meta.totalPages} onClick={() => setPage((value) => Math.min(meta.totalPages, value + 1))} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm disabled:opacity-40">Next<ArrowRight className="size-4" aria-hidden="true" /></button></div></nav>}
    </div>

    <ConfirmDialog open={Boolean(cancelTarget)} title="Cancel this appointment?" description={cancelTarget ? `Your pending ${cancelTarget.serviceSnapshot.name} booking will be cancelled and its time slot released.` : "This appointment will be cancelled."} confirmLabel={cancellingId ? "Cancelling…" : "Confirm cancellation"} cancelLabel="Keep appointment" destructive onConfirm={() => void cancelAppointment()} onOpenChange={(open) => { if (!open && !cancellingId) setCancelTarget(null); }} />
  </div>;
}

function PaymentPill({ status }: { status: "unpaid" | "paid" }) {
  const paid = status === "paid";
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${paid ? "bg-[var(--primary)]/15 text-[var(--green-light)]" : "bg-amber-500/10 text-amber-300"}`}>{status.toUpperCase()}</span>;
}
