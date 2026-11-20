"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { CalendarDays, ChevronLeft, ChevronRight, Clock3, CreditCard, Eye, Search, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/providers/toast-provider";
import { apiFetch } from "@/lib/api-client";
import { formatBDTPrice, formatSalonAppointmentTime } from "@/lib/service-format";
import type { AppointmentStatus } from "@/types/appointment";
import { StatusPill } from "./customer-appointments";

type PaymentStatus = "paid" | "unpaid";
type AdminAppointment = {
  _id: string;
  serviceId: string;
  serviceSnapshot: { name: string; category?: string; description?: string; imageUrl?: string; durationMinutes: number; price: number };
  startsAt: string;
  appointmentDate?: string;
  timeSlot?: string;
  customerNote?: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  cancelledBy?: "customer" | "admin";
  createdAt: string;
  updatedAt: string;
  customer: { name: string; email: string; phone: string; imageUrl: string };
};
type AdminAppointmentDetail = Omit<AdminAppointment, "customer"> & { customerId: string; customer: AdminAppointment["customer"] };
type AppointmentStats = { totalAppointments: number; pendingAppointments: number; confirmedAppointments: number; cancelledAppointments: number };
type ListResponse = { data: AdminAppointment[]; error: { message: string } | null; meta?: { page: number; limit: number; total: number; totalPages: number; stats: AppointmentStats } };
type DataResponse<T> = { data: T; error: { message: string } | null };
type Action = "confirm" | "cancel" | "complete";

const pageSize = 10;
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

export function AdminAppointments() {
  const toast = useToast();
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [stats, setStats] = useState<AppointmentStats>({ totalAppointments: 0, pendingAppointments: 0, confirmedAppointments: 0, cancelledAppointments: 0 });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<AdminAppointmentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionTarget, setActionTarget] = useState<{ appointment: AdminAppointment; action: Action } | null>(null);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => { setQuery(search.trim()); setPage(1); }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ search: query, status, paymentStatus, sort, page: String(page), limit: String(pageSize) });
      const response = await apiFetch(`/admin/appointments?${params}`);
      const result = (await response.json()) as ListResponse;
      if (!response.ok) throw new Error(result.error?.message ?? "Could not load appointments.");
      setAppointments(result.data);
      setTotal(result.meta?.total ?? result.data.length);
      setTotalPages(result.meta?.totalPages ?? 1);
      setStats(result.meta?.stats ?? { totalAppointments: 0, pendingAppointments: 0, confirmedAppointments: 0, cancelledAppointments: 0 });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load appointments.");
    } finally { setLoading(false); }
  }, [query, status, paymentStatus, sort, page]);

  useEffect(() => { void load(); }, [load]);

  async function openDetails(id: string) {
    setDetail(null);
    setDetailLoading(true);
    try {
      const response = await apiFetch(`/admin/appointments/${id}`);
      const result = (await response.json()) as DataResponse<AdminAppointmentDetail>;
      if (!response.ok) throw new Error(result.error?.message ?? "Could not load appointment details.");
      setDetail(result.data);
    } catch (cause) { toast(cause instanceof Error ? cause.message : "Could not load appointment details.", "error"); }
    finally { setDetailLoading(false); }
  }

  async function runAction() {
    if (!actionTarget) return;
    const { appointment, action } = actionTarget;
    setBusyId(appointment._id);
    try {
      const response = await apiFetch(`/admin/appointments/${appointment._id}/${action}`, { method: "PATCH" });
      const result = (await response.json()) as DataResponse<AdminAppointment>;
      if (!response.ok) throw new Error(result.error?.message ?? "Could not update appointment.");
      const message: Record<Action, string> = { confirm: "Appointment confirmed.", cancel: "Appointment cancelled and its slot released.", complete: "Appointment marked complete." };
      toast(message[action], "success");
      setDetail((current) => current?._id === appointment._id ? { ...current, status: result.data.status } : current);
      await load();
    } catch (cause) { toast(cause instanceof Error ? cause.message : "Could not update appointment.", "error"); }
    finally { setBusyId(""); }
  }

  const pages = Math.max(1, totalPages);
  return <div className="mt-8 space-y-6">
    <section aria-label="Appointment totals" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="All appointments" value={stats.totalAppointments} icon={<CalendarDays className="size-5" />} />
      <StatCard label="Pending requests" value={stats.pendingAppointments} icon={<Clock3 className="size-5" />} />
      <StatCard label="Confirmed" value={stats.confirmedAppointments} icon={<UserRound className="size-5" />} />
      <StatCard label="Cancelled" value={stats.cancelledAppointments} icon={<CreditCard className="size-5" />} />
    </section>

    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5" aria-label="Appointment filters">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(15rem,1fr)_11rem_11rem_13rem]">
        <label className="relative"><span className="sr-only">Search appointments</span><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer, service, or reference" className="pl-10" /></label>
        <label><span className="sr-only">Filter by appointment status</span><Select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="all">All statuses</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option><option value="completed">Completed</option></Select></label>
        <label><span className="sr-only">Filter by payment status</span><Select value={paymentStatus} onChange={(event) => { setPaymentStatus(event.target.value); setPage(1); }}><option value="all">All payments</option><option value="unpaid">Unpaid</option><option value="paid">Paid</option></Select></label>
        <label><span className="sr-only">Sort appointments</span><Select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}><option value="newest">Newest booking</option><option value="oldest">Oldest booking</option><option value="appointment-asc">Appointment date ↑</option><option value="appointment-desc">Appointment date ↓</option></Select></label>
      </div>
    </section>

    {error ? <ErrorState title="Appointments could not load" description={error} onRetry={() => void load()} /> : loading ? <div className="space-y-3" role="status" aria-label="Loading appointments">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-40 rounded-2xl" />)}</div> : appointments.length ? <>
      <p className="text-sm text-[var(--muted)]">Showing {appointments.length} of {total} appointments</p>
      <div className="space-y-3">
        {appointments.map((appointment) => <AppointmentCard key={appointment._id} appointment={appointment} onDetails={() => void openDetails(appointment._id)} onAction={(action) => setActionTarget({ appointment, action })} busy={busyId === appointment._id} />)}
      </div>
      <Pagination page={page} pages={pages} onPage={setPage} />
    </> : <EmptyState title="No appointments found" description={query || status !== "all" || paymentStatus !== "all" ? "Try adjusting the search or filters." : "Customer appointment requests will appear here."} />}

    {detailLoading && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="status"><div className="w-full max-w-2xl space-y-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"><Skeleton className="h-7 w-48" /><Skeleton className="h-32 rounded-2xl" /><Skeleton className="h-24 rounded-2xl" /></div></div>}
    {detail && <DetailDialog appointment={detail} onClose={() => setDetail(null)} />}
    <ConfirmDialog
      open={Boolean(actionTarget)}
      title={actionTarget ? actionTitle(actionTarget.action) : "Update appointment"}
      description={actionTarget ? actionDescription(actionTarget.appointment, actionTarget.action) : "Update this appointment?"}
      confirmLabel={busyId ? "Saving…" : actionTarget ? actionTitle(actionTarget.action) : "Confirm"}
      destructive={actionTarget?.action === "cancel"}
      onConfirm={() => void runAction()}
      onOpenChange={(open) => { if (!open && !busyId) setActionTarget(null); }}
    />
  </div>;
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return <article className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--primary)]/10 text-[var(--green-light)]">{icon}</span><div><p className="text-sm text-[var(--muted)]">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p></div></article>;
}

function AppointmentCard({ appointment, onDetails, onAction, busy }: { appointment: AdminAppointment; onDetails: () => void; onAction: (action: Action) => void; busy: boolean }) {
  return <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
    <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex min-w-0 gap-4">
        {appointment.serviceSnapshot.imageUrl ? <Image src={appointment.serviceSnapshot.imageUrl} alt="" width={80} height={80} unoptimized className="hidden size-20 shrink-0 rounded-xl object-cover sm:block" /> : <div className="hidden size-20 shrink-0 place-items-center rounded-xl bg-[var(--surface)] text-[var(--muted)] sm:grid"><CalendarDays className="size-6" /></div>}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><h2 className="text-lg font-semibold">{appointment.serviceSnapshot.name}</h2><StatusPill status={appointment.status} /><PaymentPill status={appointment.paymentStatus} /></div>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-[var(--muted)]"><span>{formatSalonAppointmentTime(appointment.appointmentDate, appointment.timeSlot, appointment.startsAt)}</span><span>{appointment.serviceSnapshot.durationMinutes} min · {formatBDTPrice(appointment.serviceSnapshot.price)}</span></div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"><span className="font-medium">{appointment.customer.name}</span><a className="text-[var(--muted)] hover:text-[var(--green-light)]" href={`mailto:${appointment.customer.email}`}>{appointment.customer.email || "No email available"}</a>{appointment.customer.phone && <span className="text-[var(--muted)]">{appointment.customer.phone}</span>}</div>
          <p className="mt-2 font-mono text-xs text-[var(--muted)]">Ref {appointment._id}</p>
          {appointment.customerNote && <p className="mt-3 line-clamp-2 max-w-3xl rounded-xl bg-[var(--surface)] px-3 py-2 text-sm text-[var(--muted)]">Customer note: {appointment.customerNote}</p>}
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap gap-2 xl:justify-end">
        <Button variant="secondary" size="sm" onClick={onDetails}><Eye className="size-4" />Details</Button>
        {appointment.status === "pending" && <Button size="sm" disabled={busy} onClick={() => onAction("confirm")}>Confirm</Button>}
        {["pending", "confirmed"].includes(appointment.status) && <Button variant="danger" size="sm" disabled={busy} onClick={() => onAction("cancel")}>Cancel</Button>}
        {appointment.status === "confirmed" && <Button variant="secondary" size="sm" disabled={busy} onClick={() => onAction("complete")}>Complete</Button>}
      </div>
    </div>
  </article>;
}

function PaymentPill({ status }: { status: PaymentStatus }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${status === "paid" ? "bg-[var(--primary)]/15 text-[var(--green-light)]" : "bg-amber-500/10 text-amber-300"}`}>{status}</span>;
}

function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4"><p className="text-sm text-[var(--muted)]">Page {page} of {pages}</p><div className="flex gap-2"><Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft className="size-4" />Previous</Button><Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next<ChevronRight className="size-4" /></Button></div></div>;
}

function DetailDialog({ appointment, onClose }: { appointment: AdminAppointmentDetail; onClose: () => void }) {
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="appointment-detail-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:p-7">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--green-light)]">Appointment detail</p><h2 id="appointment-detail-title" className="mt-2 text-2xl font-semibold">{appointment.serviceSnapshot.name}</h2></div><Button variant="secondary" size="sm" onClick={onClose}>Close</Button></div>
      <div className="mt-5 flex flex-wrap gap-2"><StatusPill status={appointment.status} /><PaymentPill status={appointment.paymentStatus} /></div>
      {appointment.serviceSnapshot.imageUrl && <Image src={appointment.serviceSnapshot.imageUrl} alt={`${appointment.serviceSnapshot.name} service`} width={720} height={360} unoptimized className="mt-5 max-h-64 w-full rounded-2xl object-cover" />}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <DetailItem label="Customer" value={appointment.customer.name} /><DetailItem label="Email" value={appointment.customer.email || "Not provided"} /><DetailItem label="Phone" value={appointment.customer.phone || "Not provided"} />
        <DetailItem label="Appointment time" value={formatSalonAppointmentTime(appointment.appointmentDate, appointment.timeSlot, appointment.startsAt)} /><DetailItem label="Service duration" value={`${appointment.serviceSnapshot.durationMinutes} minutes`} /><DetailItem label="Service price" value={formatBDTPrice(appointment.serviceSnapshot.price)} /><DetailItem label="Requested on" value={dateFormat.format(new Date(appointment.createdAt))} /><DetailItem label="Reference" value={appointment._id} />
      </div>
      {appointment.customerNote && <div className="mt-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Customer note</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6">{appointment.customerNote}</p></div>}
    </section>
  </div>;
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return <div className="min-w-0 rounded-xl bg-[var(--card)] p-3"><p className="text-xs text-[var(--muted)]">{label}</p><p className="mt-1 break-words text-sm font-medium">{value}</p></div>;
}

function actionTitle(action: Action) {
  return action === "confirm" ? "Confirm appointment?" : action === "cancel" ? "Cancel appointment?" : "Complete appointment?";
}

function actionDescription(appointment: AdminAppointment, action: Action) {
  if (action === "confirm") return `Confirm ${appointment.serviceSnapshot.name} for ${appointment.customer.name}. The appointment time will remain reserved.`;
  if (action === "cancel") return `Cancel ${appointment.serviceSnapshot.name} for ${appointment.customer.name} and release its reserved salon time. This does not change any payment record.`;
  return `Mark ${appointment.serviceSnapshot.name} for ${appointment.customer.name} as completed? This does not change any payment record.`;
}
