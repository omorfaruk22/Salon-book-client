"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Clock3, Eye, LoaderCircle, Plus, Search, Scissors, SquarePen, Trash2, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/providers/toast-provider";
import { apiFetch } from "@/lib/api-client";
import { formatBDTPrice, formatServiceDuration } from "@/lib/service-format";
import type { ApiEnvelope, SalonService } from "@/types/service";

type SortOption = "newest" | "oldest" | "price-asc" | "price-desc";
type ServiceListMeta = NonNullable<ApiEnvelope<SalonService[]>["meta"]> & {
  totalServices?: number; activeServices?: number; inactiveServices?: number; categories?: string[];
};
type ServiceListResponse = ApiEnvelope<SalonService[]> & { meta?: ServiceListMeta };
type PendingAction = { kind: "delete" | "status"; service: SalonService } | null;
const PAGE_SIZE = 10;

export function AdminServiceManager() {
  const toast = useToast();
  const [services, setServices] = useState<SalonService[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [meta, setMeta] = useState<ServiceListMeta | undefined>();
  const [searchDraft, setSearchDraft] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState<PendingAction>(null);
  const [workingId, setWorkingId] = useState("");
  const [viewing, setViewing] = useState<SalonService | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setSearch(searchDraft.trim());
    }, 250);
    return () => window.clearTimeout(timer);
  }, [searchDraft]);

  const loadServices = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE), status, sort });
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    try {
      const response = await apiFetch("/services/admin?" + params.toString(), { cache: "no-store", signal });
      const result = await response.json().catch(() => null) as ServiceListResponse | null;
      if (!response.ok || !result || !Array.isArray(result.data)) throw new Error(result?.error?.message ?? "Could not load the service catalog.");
      setServices(result.data);
      setMeta(result.meta);
      setCategories((result.meta?.categories ?? []).filter((item): item is string => typeof item === "string"));
      const totalPages = Math.max(1, result.meta?.totalPages ?? 1);
      if (page > totalPages) setPage(totalPages);
    } catch (cause) {
      if (!signal?.aborted) {
        setServices([]);
        setMeta(undefined);
        setError(cause instanceof Error ? cause.message : "Could not load the service catalog.");
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [category, page, search, sort, status]);

  useEffect(() => {
    const controller = new AbortController();
    void loadServices(controller.signal);
    return () => controller.abort();
  }, [loadServices]);

  async function refresh() {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
  }

  async function runPendingAction() {
    if (!pendingAction) return;
    const { kind, service } = pendingAction;
    setPendingAction(null);
    setWorkingId(service._id);
    try {
      const response = kind === "delete"
        ? await apiFetch("/services/" + service._id, { method: "DELETE" })
        : await apiFetch("/services/" + service._id + "/status", { method: "PATCH", body: JSON.stringify({ isActive: !service.isActive }) });
      const result = await response.json().catch(() => null) as ApiEnvelope<SalonService> | null;
      if (!response.ok) throw new Error(result?.error?.message ?? (kind === "delete" ? "Could not delete the service." : "Could not update the service status."));
      toast(kind === "delete" ? "Service deleted." : service.isActive ? "Service deactivated." : "Service activated.", "success");
      await loadServices();
    } catch (cause) {
      toast(cause instanceof Error ? cause.message : "The service could not be updated.", "error");
      await loadServices();
    } finally { setWorkingId(""); }
  }

  const stats = [
    { label: "Total services", value: meta?.totalServices },
    { label: "Active", value: meta?.activeServices },
    { label: "Inactive", value: meta?.inactiveServices },
  ];

  return <div className="mt-8 space-y-7">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      <Button variant="secondary" onClick={() => void refresh()} disabled={refreshing || loading}>
        <LoaderCircle className={refreshing ? "size-4 animate-spin" : "size-4"} aria-hidden="true" />Refresh
      </Button>
    </div>

    <section aria-label="Service statistics" className="grid gap-3 sm:grid-cols-3">
      {stats.map((stat, index) => <article key={stat.label} className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
        <p className="text-sm text-[var(--muted)]">{stat.label}</p>
        {stat.value === undefined || loading && !meta ? <Skeleton className="mt-3 h-8 w-16" /> : <p className="mt-2 text-3xl font-semibold tabular-nums">{stat.value}</p>}
        <span className={"mt-3 block h-1 w-12 rounded-full " + (index === 1 ? "bg-[var(--green-light)]" : index === 2 ? "bg-slate-500" : "bg-[var(--primary)]")} />
      </article>)}
    </section>

    <section className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)]">
      <div className="border-b border-[var(--border)] p-4 sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1fr)_minmax(150px,.7fr)_minmax(150px,.7fr)_minmax(170px,.75fr)]">
          <label className="relative block"><span className="sr-only">Search services</span><Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" aria-hidden="true" /><Input value={searchDraft} maxLength={100} onChange={(event) => setSearchDraft(event.target.value)} placeholder="Search service names" className="pl-10" /></label>
          <label><span className="sr-only">Filter by category</span><Select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); }}><option value="">All categories</option>{categories.map((value) => <option key={value} value={value}>{formatCategory(value)}</option>)}</Select></label>
          <label><span className="sr-only">Filter by status</span><Select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="all">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></Select></label>
          <label><span className="sr-only">Sort services</span><Select value={sort} onChange={(event) => { setSort(event.target.value as SortOption); setPage(1); }}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></Select></label>
        </div>
      </div>

      {error ? <div className="p-5"><ErrorState title="Service catalog unavailable" description={error} onRetry={() => void loadServices()} /></div>
        : loading ? <div className="space-y-3 p-5" role="status"><span className="sr-only">Loading services</span>{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-24 rounded-2xl" />)}</div>
          : services.length === 0 ? <div className="p-5"><EmptyState icon={<Scissors className="size-5" />} title={search || category || status !== "all" ? "No services match these filters" : "No services yet"} description={search || category || status !== "all" ? "Change or clear your filters to see other services." : "Add your first service to start building the salon menu."} action={<Button asChild><Link href="/admin/services/new"><Plus className="size-4" />Add service</Link></Button>} /></div>
            : <div className="divide-y divide-[var(--border)]">
              {services.map((service) => <ServiceRow key={service._id} service={service} busy={workingId === service._id} onView={() => setViewing(service)} onStatus={() => setPendingAction({ kind: "status", service })} onDelete={() => setPendingAction({ kind: "delete", service })} />)}
            </div>}

      <div className="flex flex-col gap-3 border-t border-[var(--border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <p className="text-sm text-[var(--muted)]">{loading ? "Loading service count…" : (meta?.total ?? 0) + " matching " + ((meta?.total ?? 0) === 1 ? "service" : "services")}</p>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <Button variant="secondary" size="sm" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={loading || page <= 1}><ChevronLeft className="size-4" />Previous</Button>
          <span className="min-w-20 text-center text-sm tabular-nums text-[var(--muted)]">Page {page} of {Math.max(1, meta?.totalPages ?? 1)}</span>
          <Button variant="secondary" size="sm" onClick={() => setPage((value) => value + 1)} disabled={loading || page >= (meta?.totalPages ?? 1)}>Next<ChevronRight className="size-4" /></Button>
        </div>
      </div>
    </section>

    <ConfirmDialog open={Boolean(pendingAction)} title={pendingAction?.kind === "delete" ? "Delete service permanently?" : pendingAction?.service.isActive ? "Deactivate this service?" : "Activate this service?"}
      description={pendingAction?.kind === "delete" ? "“" + pendingAction.service.name + "” will be permanently removed if it has no appointment history. Services with appointments are protected and should be deactivated instead. This action cannot be undone."
        : pendingAction?.service.isActive ? "“" + pendingAction.service.name + "” will disappear from public listings and customers will not be able to book it. Existing appointments will remain available."
          : "“" + pendingAction?.service.name + "” will return to public listings and become available for new bookings."}
      confirmLabel={pendingAction?.kind === "delete" ? "Delete service" : pendingAction?.service.isActive ? "Deactivate" : "Activate"}
      destructive={pendingAction?.kind === "delete" || pendingAction?.service.isActive}
      onConfirm={() => void runPendingAction()} onOpenChange={(open) => { if (!open) setPendingAction(null); }} />

    {viewing && <div className="fixed inset-0 z-[90] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setViewing(null); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="service-preview-title" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-2xl sm:p-7">
        <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--green-light)]">Service preview</p><h2 id="service-preview-title" className="mt-2 text-2xl font-semibold">{viewing.name}</h2></div><button type="button" onClick={() => setViewing(null)} className="rounded-lg border border-[var(--border)] px-3 py-2 text-sm text-[var(--muted)] hover:text-white">Close</button></div>
        <div className="relative mt-5 h-56 overflow-hidden rounded-2xl bg-[var(--card)]">{viewing.imageUrl ? <Image src={viewing.imageUrl} alt={viewing.name} fill unoptimized sizes="(max-width: 640px) 100vw, 560px" className="object-cover" /> : <div className="grid h-full place-items-center"><Scissors className="size-10 text-[var(--green-light)]" /></div>}</div>
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{viewing.description}</p>
        <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"><p className="text-xs text-[var(--muted)]">Price</p><p className="mt-1 font-semibold">{formatBDTPrice(viewing.price)}</p></div><div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4"><p className="text-xs text-[var(--muted)]">Duration</p><p className="mt-1 font-semibold">{formatServiceDuration(viewing.durationMinutes)}</p></div></div>
      </section>
    </div>}
  </div>;
}

function ServiceRow({ service, busy, onView, onStatus, onDelete }: { service: SalonService; busy: boolean; onView: () => void; onStatus: () => void; onDelete: () => void }) {
  return <article className="grid gap-4 p-4 transition hover:bg-white/[.02] sm:p-5 lg:grid-cols-[minmax(230px,1.5fr)_minmax(95px,.6fr)_minmax(100px,.65fr)_minmax(105px,.65fr)_minmax(225px,1fr)] lg:items-center">
    <div className="flex min-w-0 items-center gap-3">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]">{service.imageUrl ? <Image src={service.imageUrl} alt={service.name} fill unoptimized sizes="64px" className="object-cover" /> : <div className="grid h-full place-items-center"><Scissors className="size-5 text-[var(--green-light)]" /></div>}</div>
      <div className="min-w-0"><h2 className="truncate font-semibold">{service.name}</h2><p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--muted)]">{service.description}</p><p className="mt-1 text-[11px] text-[var(--muted)]">Created {formatDate(service.createdAt)}</p></div>
    </div>
    <div><p className="text-[11px] uppercase tracking-wide text-[var(--muted)] lg:hidden">Category</p><p className="mt-1 text-sm capitalize lg:mt-0">{formatCategory(service.category)}</p></div>
    <div><p className="text-[11px] uppercase tracking-wide text-[var(--muted)] lg:hidden">Price</p><p className="mt-1 text-sm font-semibold lg:mt-0">{formatBDTPrice(service.price)}</p></div>
    <div><p className="text-[11px] uppercase tracking-wide text-[var(--muted)] lg:hidden">Status · Duration</p><div className="mt-1 flex flex-wrap items-center gap-2 lg:mt-0"><span className={service.isActive ? "rounded-full bg-[var(--primary)]/15 px-2.5 py-1 text-xs font-medium text-[var(--green-light)]" : "rounded-full bg-slate-700/60 px-2.5 py-1 text-xs font-medium text-slate-300"}>{service.isActive ? "Active" : "Inactive"}</span><span className="inline-flex items-center gap-1 text-xs text-[var(--muted)]"><Clock3 className="size-3.5" />{formatServiceDuration(service.durationMinutes)}</span></div></div>
    <div className="flex flex-wrap gap-2 border-t border-[var(--border)] pt-3 lg:border-0 lg:pt-0">
      <Button variant="secondary" size="sm" onClick={onView} aria-label={"View " + service.name}><Eye className="size-4" />View</Button>
      <Button asChild variant="secondary" size="sm"><Link href={"/admin/services/" + service._id + "/edit"} aria-label={"Edit " + service.name}><SquarePen className="size-4" />Edit</Link></Button>
      <Button variant="secondary" size="sm" onClick={onStatus} disabled={busy} aria-label={(service.isActive ? "Deactivate " : "Activate ") + service.name}><Power className="size-4" />{service.isActive ? "Deactivate" : "Activate"}</Button>
      <Button variant="danger" size="sm" onClick={onDelete} disabled={busy} aria-label={"Delete " + service.name}><Trash2 className="size-4" />Delete</Button>
    </div>
  </article>;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(date);
}

function formatCategory(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toLocaleUpperCase());
}
