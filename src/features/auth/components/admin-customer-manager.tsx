"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { Ban, ChevronLeft, ChevronRight, Eye, Search, ShieldCheck, UsersRound } from "lucide-react";
import { useToast } from "@/components/providers/toast-provider";
import { apiFetch } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import type { SalonUser } from "@/types/appointment";

type CustomerStats = { totalCustomers: number; activeCustomers: number; blockedCustomers: number };
type CustomerListResponse = { data: SalonUser[]; error: { message: string } | null; meta?: { page: number; limit: number; total: number; totalPages: number; stats: CustomerStats } };
type CustomerDetails = { customer: SalonUser; appointments: { totalAppointments: number; pendingAppointments: number; confirmedAppointments: number; cancelledAppointments: number } };
type DataResponse<T> = { data: T; error: { message: string } | null };
type CustomerAction = { customer: SalonUser; nextStatus: "active" | "blocked" };

const pageSize = 10;

export function AdminCustomerManager() {
  const toast = useToast();
  const [customers, setCustomers] = useState<SalonUser[]>([]);
  const [stats, setStats] = useState<CustomerStats>({ totalCustomers: 0, activeCustomers: 0, blockedCustomers: 0 });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [detail, setDetail] = useState<CustomerDetails | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionTarget, setActionTarget] = useState<CustomerAction | null>(null);
  const [busyId, setBusyId] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => { setQuery(search.trim()); setPage(1); }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams({ search: query, status, sort, page: String(page), limit: String(pageSize) });
      const response = await apiFetch(`/admin/users?${params}`);
      const result = (await response.json()) as CustomerListResponse;
      if (!response.ok) throw new Error(result.error?.message ?? "Could not load customers.");
      setCustomers(result.data);
      setTotal(result.meta?.total ?? result.data.length);
      setTotalPages(result.meta?.totalPages ?? 1);
      setStats(result.meta?.stats ?? { totalCustomers: 0, activeCustomers: 0, blockedCustomers: 0 });
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load customers."); }
    finally { setLoading(false); }
  }, [query, status, sort, page]);

  useEffect(() => { void load(); }, [load]);

  async function openDetails(customerId: string) {
    setDetail(null);
    setDetailLoading(true);
    try {
      const response = await apiFetch(`/admin/users/${customerId}`);
      const result = (await response.json()) as DataResponse<CustomerDetails>;
      if (!response.ok) throw new Error(result.error?.message ?? "Could not load customer details.");
      setDetail(result.data);
    } catch (cause) { toast(cause instanceof Error ? cause.message : "Could not load customer details.", "error"); }
    finally { setDetailLoading(false); }
  }

  async function changeStatus() {
    if (!actionTarget) return;
    const { customer, nextStatus } = actionTarget;
    setBusyId(customer._id);
    try {
      const action = nextStatus === "blocked" ? "block" : "unblock";
      const response = await apiFetch(`/admin/users/${customer._id}/${action}`, { method: "PATCH" });
      const result = (await response.json()) as DataResponse<SalonUser>;
      if (!response.ok) throw new Error(result.error?.message ?? "Could not update customer access.");
      toast(nextStatus === "blocked" ? "Customer account blocked. Existing sessions can no longer use protected services." : "Customer account unblocked.", "success");
      setDetail((current) => current?.customer._id === customer._id ? { ...current, customer: result.data } : current);
      await load();
    } catch (cause) { toast(cause instanceof Error ? cause.message : "Could not update customer access.", "error"); }
    finally { setBusyId(""); }
  }

  const pages = Math.max(1, totalPages);
  return <div className="mt-8 space-y-6">
    <section aria-label="Customer totals" className="grid gap-3 sm:grid-cols-3">
      <StatCard label="All customers" value={stats.totalCustomers} icon={<UsersRound className="size-5" />} />
      <StatCard label="Active accounts" value={stats.activeCustomers} icon={<ShieldCheck className="size-5" />} />
      <StatCard label="Blocked accounts" value={stats.blockedCustomers} icon={<Ban className="size-5" />} />
    </section>

    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5" aria-label="Customer filters">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(16rem,1fr)_12rem_13rem]">
        <label className="relative"><span className="sr-only">Search customers</span><Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by customer name or email" className="pl-10" /></label>
        <label><span className="sr-only">Filter customer status</span><Select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="all">All customers</option><option value="active">Active</option><option value="blocked">Blocked</option></Select></label>
        <label><span className="sr-only">Sort customers</span><Select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="name-asc">Name A–Z</option><option value="name-desc">Name Z–A</option></Select></label>
      </div>
    </section>

    {error ? <ErrorState title="Customers could not load" description={error} onRetry={() => void load()} /> : loading ? <div className="space-y-3" role="status" aria-label="Loading customers">{[0, 1, 2].map((item) => <Skeleton key={item} className="h-24 rounded-2xl" />)}</div> : customers.length ? <>
      <p className="text-sm text-[var(--muted)]">Showing {customers.length} of {total} customers</p>
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[780px] text-left text-sm">
          <thead className="bg-[var(--card)] text-xs uppercase tracking-wide text-[var(--muted)]"><tr><th className="px-5 py-4 font-semibold">Customer</th><th className="px-5 py-4 font-semibold">Phone</th><th className="px-5 py-4 font-semibold">Joined</th><th className="px-5 py-4 font-semibold">Status</th><th className="px-5 py-4 text-right font-semibold">Actions</th></tr></thead>
          <tbody>{customers.map((customer) => <tr key={customer._id} className="border-t border-[var(--border)]"><td className="px-5 py-4"><CustomerIdentity customer={customer} /></td><td className="px-5 py-4 text-[var(--muted)]">{customer.phone || "—"}</td><td className="px-5 py-4 text-[var(--muted)]">{formatDate(customer.createdAt)}</td><td className="px-5 py-4"><StatusBadge status={customer.status} /></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><Button variant="secondary" size="sm" onClick={() => void openDetails(customer._id)}><Eye className="size-4" />Details</Button><StatusAction customer={customer} onClick={() => setActionTarget({ customer, nextStatus: customer.status === "active" ? "blocked" : "active" })} disabled={busyId === customer._id} /></div></td></tr>)}</tbody>
        </table></div>
        <div className="divide-y divide-[var(--border)] md:hidden">{customers.map((customer) => <article key={customer._id} className="space-y-3 p-4"><div className="flex items-start justify-between gap-3"><CustomerIdentity customer={customer} /><StatusBadge status={customer.status} /></div><p className="text-xs text-[var(--muted)]">{customer.phone || "No phone"} · Joined {formatDate(customer.createdAt)}</p><div className="flex flex-wrap gap-2"><Button variant="secondary" size="sm" onClick={() => void openDetails(customer._id)}><Eye className="size-4" />Details</Button><StatusAction customer={customer} onClick={() => setActionTarget({ customer, nextStatus: customer.status === "active" ? "blocked" : "active" })} disabled={busyId === customer._id} /></div></article>)}</div>
      </div>
      <Pagination page={page} pages={pages} onPage={setPage} />
    </> : <EmptyState title="No customers found" description={query || status !== "all" ? "Try a different name, email, or status filter." : "Customer accounts will appear here after registration."} />}

    {detailLoading && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="status"><div className="w-full max-w-xl space-y-3 rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-36 rounded-2xl" /><Skeleton className="h-24 rounded-2xl" /></div></div>}
    {detail && <CustomerDetailDialog details={detail} onClose={() => setDetail(null)} onStatusChange={() => setActionTarget({ customer: detail.customer, nextStatus: detail.customer.status === "active" ? "blocked" : "active" })} />}
    <ConfirmDialog open={Boolean(actionTarget)} title={actionTarget?.nextStatus === "blocked" ? "Block this customer?" : "Unblock this customer?"} description={actionTarget ? actionTarget.nextStatus === "blocked" ? `${actionTarget.customer.name} will immediately lose access to protected booking and profile features. Existing appointments and payments will not be changed.` : `${actionTarget.customer.name} will be able to sign in and use customer features again.` : "Update customer access?"} confirmLabel={actionTarget?.nextStatus === "blocked" ? "Block customer" : "Unblock customer"} destructive={actionTarget?.nextStatus === "blocked"} onConfirm={() => void changeStatus()} onOpenChange={(open) => { if (!open && !busyId) setActionTarget(null); }} />
  </div>;
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return <article className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"><span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[var(--primary)]/10 text-[var(--green-light)]">{icon}</span><div><p className="text-sm text-[var(--muted)]">{label}</p><p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p></div></article>;
}

function CustomerIdentity({ customer }: { customer: SalonUser }) {
  return <div className="flex min-w-0 items-center gap-3">{customer.imageUrl ? <Image src={customer.imageUrl} alt="" width={40} height={40} unoptimized className="size-10 shrink-0 rounded-full object-cover" /> : <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--primary)]/15 font-semibold text-[var(--green-light)]">{customer.name.trim().charAt(0).toUpperCase() || "C"}</span>}<div className="min-w-0"><p className="truncate font-medium">{customer.name}</p><p className="truncate text-xs text-[var(--muted)]">{customer.email}</p></div></div>;
}

function StatusBadge({ status }: { status: "active" | "blocked" }) {
  return <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${status === "active" ? "bg-[var(--primary)]/15 text-[var(--green-light)]" : "bg-red-500/10 text-red-300"}`}>{status}</span>;
}

function StatusAction({ customer, onClick, disabled }: { customer: SalonUser; onClick: () => void; disabled: boolean }) {
  return <Button variant={customer.status === "active" ? "danger" : "primary"} size="sm" disabled={disabled} onClick={onClick}>{customer.status === "active" ? <><Ban className="size-4" />Block</> : <><ShieldCheck className="size-4" />Unblock</>}</Button>;
}

function Pagination({ page, pages, onPage }: { page: number; pages: number; onPage: (page: number) => void }) {
  return <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] pt-4"><p className="text-sm text-[var(--muted)]">Page {page} of {pages}</p><div className="flex gap-2"><Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}><ChevronLeft className="size-4" />Previous</Button><Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>Next<ChevronRight className="size-4" /></Button></div></div>;
}

function CustomerDetailDialog({ details, onClose, onStatusChange }: { details: CustomerDetails; onClose: () => void; onStatusChange: () => void }) {
  const { customer, appointments } = details;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="customer-detail-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:p-7">
      <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--green-light)]">Customer profile</p><h2 id="customer-detail-title" className="mt-2 text-2xl font-semibold">{customer.name}</h2></div><Button variant="secondary" size="sm" onClick={onClose}>Close</Button></div>
      <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:flex-row sm:items-center">{customer.imageUrl ? <Image src={customer.imageUrl} alt={`${customer.name} profile`} width={64} height={64} unoptimized className="size-16 rounded-2xl object-cover" /> : <span className="grid size-16 place-items-center rounded-2xl bg-[var(--primary)]/15 text-2xl font-semibold text-[var(--green-light)]">{customer.name.trim().charAt(0).toUpperCase() || "C"}</span>}<div className="min-w-0 flex-1"><p className="break-all text-sm">{customer.email}</p><p className="mt-1 text-sm text-[var(--muted)]">{customer.phone || "No phone number"} · Joined {formatDate(customer.createdAt)}</p><div className="mt-2"><StatusBadge status={customer.status} /></div></div><Button variant={customer.status === "active" ? "danger" : "primary"} size="sm" onClick={onStatusChange}>{customer.status === "active" ? "Block customer" : "Unblock customer"}</Button></div>
      <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">Appointment activity</h3>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4"><ActivityCard label="Total" value={appointments.totalAppointments} /><ActivityCard label="Pending" value={appointments.pendingAppointments} /><ActivityCard label="Confirmed" value={appointments.confirmedAppointments} /><ActivityCard label="Cancelled" value={appointments.cancelledAppointments} /></div>
    </section>
  </div>;
}

function ActivityCard({ label, value }: { label: string; value: number }) {
  return <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"><p className="text-xs text-[var(--muted)]">{label}</p><p className="mt-1 text-xl font-semibold">{value}</p></div>;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}
