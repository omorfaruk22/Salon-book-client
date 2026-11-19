"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, RotateCcw, Scissors, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { SectionHeading } from "@/components/ui/section-heading";
import { Select } from "@/components/ui/select";
import { ServiceCard } from "@/components/ui/service-card";
import { ServiceCardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { apiUrl } from "@/lib/api-url";
import type { ApiEnvelope, SalonService } from "@/types/service";

type SortOption = "default" | "price-asc" | "price-desc";
type BrowseMeta = { page: number; limit: number; total: number; totalPages: number; activeTotal: number; categories: string[] };
type BrowseResponse = ApiEnvelope<SalonService[]> & { meta?: Partial<BrowseMeta> };
type BrowseState = { search: string; category: string; sort: SortOption; page: number; limit: number };

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 48;

export function ServiceBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryString = searchParams.toString();
  const rawSearchValues = searchParams.getAll("search");
  const legacySearchValues = searchParams.getAll("q");
  const rawSearchCount = rawSearchValues.length;
  const legacySearchCount = legacySearchValues.length;
  const duplicateFilterKeys = ["category", "sort", "page", "limit"].filter((key) => searchParams.getAll(key).length > 1).join(",");
  const rawSearch = rawSearchValues[0] ?? legacySearchValues[0] ?? "";
  const searchFromUrl = rawSearch.trim();
  const categoryFromUrl = searchParams.get("category") ?? "";
  const rawSort = searchParams.get("sort") ?? "default";
  const sortFromUrl = parseSort(rawSort);
  const rawPage = searchParams.get("page") ?? "1";
  const rawLimit = searchParams.get("limit") ?? String(DEFAULT_LIMIT);
  const pageFromUrl = parsePositiveInteger(rawPage);
  const limitFromUrl = parsePositiveInteger(rawLimit);
  const invalidQuery = useMemo(() => {
    const duplicateSearch = rawSearchCount > 1 || legacySearchCount > 1 || (rawSearchCount > 0 && legacySearchCount > 0);
    return Boolean(duplicateFilterKeys) || duplicateSearch || sortFromUrl === null || pageFromUrl === null || (pageFromUrl - 1) * MAX_LIMIT > Number.MAX_SAFE_INTEGER || limitFromUrl === null || limitFromUrl > MAX_LIMIT || searchFromUrl.length > 100 || categoryFromUrl.trim().length > 60;
  }, [categoryFromUrl, duplicateFilterKeys, legacySearchCount, limitFromUrl, pageFromUrl, rawSearchCount, searchFromUrl, sortFromUrl]);

  const [search, setSearch] = useState(searchFromUrl);
  const [services, setServices] = useState<SalonService[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [meta, setMeta] = useState<BrowseMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  const stateFromUrl = useMemo<BrowseState>(() => ({
    search: searchFromUrl,
    category: categoryFromUrl.trim(),
    sort: sortFromUrl ?? "default",
    page: pageFromUrl ?? 1,
    limit: limitFromUrl && limitFromUrl <= MAX_LIMIT ? limitFromUrl : DEFAULT_LIMIT,
  }), [categoryFromUrl, limitFromUrl, pageFromUrl, searchFromUrl, sortFromUrl]);

  const navigateWithState = useCallback((patch: Partial<BrowseState>, history: "push" | "replace" = "push") => {
    const nextState = { ...stateFromUrl, ...patch };
    const params = new URLSearchParams();
    const normalizedSearch = nextState.search.trim();
    if (normalizedSearch) params.set("search", normalizedSearch);
    if (nextState.category.trim()) params.set("category", nextState.category.trim());
    if (nextState.sort !== "default") params.set("sort", nextState.sort);
    if (nextState.page > 1) params.set("page", String(nextState.page));
    if (nextState.limit !== DEFAULT_LIMIT) params.set("limit", String(nextState.limit));

    const query = params.toString();
    const nextUrl = query ? `${pathname}?${query}` : pathname;
    if (nextUrl === (queryString ? `${pathname}?${queryString}` : pathname)) return;
    if (history === "replace") router.replace(nextUrl, { scroll: false });
    else router.push(nextUrl, { scroll: false });
  }, [pathname, queryString, router, stateFromUrl]);

  useEffect(() => {
    setSearch(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    if (invalidQuery) return;
    const normalized = search.trim();
    const canonicalSearch = legacySearchCount === 0 && (
      normalized ? rawSearchCount === 1 && rawSearch === normalized : rawSearchCount === 0
    );
    if (normalized === searchFromUrl && canonicalSearch) return;

    const timer = window.setTimeout(() => navigateWithState({ search: normalized, page: 1 }, "replace"), 350);
    return () => window.clearTimeout(timer);
  }, [invalidQuery, legacySearchCount, navigateWithState, rawSearch, rawSearchCount, search, searchFromUrl]);

  useEffect(() => {
    const controller = new AbortController();
    if (invalidQuery) {
      setLoading(false);
      setError("");
      setServices([]);
      setMeta(null);
      setCategories([]);
      return () => controller.abort();
    }

    async function loadServices() {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: String(stateFromUrl.page), limit: String(stateFromUrl.limit), sort: stateFromUrl.sort });
      if (stateFromUrl.search) params.set("search", stateFromUrl.search);
      if (stateFromUrl.category) params.set("category", stateFromUrl.category);
      try {
        const response = await fetch(apiUrl(`/services?${params.toString()}`), { signal: controller.signal, cache: "no-store" });
        const result = await response.json().catch(() => null) as BrowseResponse | null;
        if (!response.ok || !result || !Array.isArray(result.data)) throw new Error("The service menu is temporarily unavailable.");

        const activeServices = result.data.filter((service) => service.isActive);
        const total = safeCount(result.meta?.total, activeServices.length);
        const limit = safeCount(result.meta?.limit, stateFromUrl.limit);
        const totalPages = safeCount(result.meta?.totalPages, Math.ceil(total / limit));
        const categoryNames = Array.from(new Set((result.meta?.categories ?? []).filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)));

        setServices(activeServices);
        setCategories(categoryNames.sort((a, b) => a.localeCompare(b)));
        setMeta({
          page: safeCount(result.meta?.page, stateFromUrl.page),
          limit,
          total,
          totalPages,
          activeTotal: safeCount(result.meta?.activeTotal, total),
          categories: categoryNames,
        });

        if (stateFromUrl.page > Math.max(1, totalPages)) navigateWithState({ page: Math.max(1, totalPages) }, "replace");
      } catch {
        if (!controller.signal.aborted) {
          setServices([]);
          setMeta(null);
          setError("We couldn't load salon services. Check your connection and try again.");
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadServices();
    return () => controller.abort();
  }, [invalidQuery, navigateWithState, retry, stateFromUrl.category, stateFromUrl.limit, stateFromUrl.page, stateFromUrl.search, stateFromUrl.sort]);

  const hasActiveFilters = Boolean(search.trim() || stateFromUrl.category || stateFromUrl.sort !== "default" || stateFromUrl.page !== 1 || stateFromUrl.limit !== DEFAULT_LIMIT);

  function resetFilters() {
    setSearch("");
    router.push(pathname, { scroll: false });
  }

  return <main className="pb-16 sm:pb-20">
    <section className="border-b border-[var(--border)] bg-[radial-gradient(ellipse_at_78%_0%,rgb(22_163_74_/_12%),transparent_42%),linear-gradient(180deg,var(--surface),var(--background))] py-12 sm:py-16">
      <Container>
        <SectionHeading eyebrow="The SalonBook menu" title="Explore Our Services" description="Find the perfect salon service for your style, beauty, and personal care." />
        <p className="mt-5 text-sm text-[var(--muted)]" aria-live="polite">{loading ? "Loading service menu…" : error || invalidQuery ? "Service count is unavailable" : `${meta?.activeTotal ?? 0} active ${meta?.activeTotal === 1 ? "service" : "services"} available`}</p>
      </Container>
    </section>

    <Container className="pt-7 sm:pt-9">
      <section aria-label="Search and filter services">
        <div className="grid grid-cols-1 gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-3 sm:grid-cols-2 sm:p-4 md:grid-cols-[minmax(0,1fr)_minmax(170px,.72fr)_minmax(170px,.72fr)_auto] md:items-end">
          <label className="relative col-span-1 block sm:col-span-2 md:col-span-1">
            <span className="mb-2 block text-xs font-medium text-[var(--muted)]">Search by service name</span>
            <Search className="pointer-events-none absolute left-4 top-[2.55rem] size-4 -translate-y-1/2 text-[var(--muted)]" aria-hidden="true" />
            <Input type="text" inputMode="search" value={search} maxLength={100} onChange={(event) => setSearch(event.target.value)} placeholder="Search services by name..." aria-label="Search services by name" className="pl-11 pr-11" />
            {search && <button type="button" onClick={() => { setSearch(""); navigateWithState({ search: "", page: 1 }); }} aria-label="Clear search" className="absolute right-1.5 top-[2.3rem] grid size-9 -translate-y-1/2 place-items-center rounded-lg text-[var(--muted)] transition hover:bg-[var(--card)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)]"><X className="size-4" aria-hidden="true" /></button>}
          </label>

          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-medium text-[var(--muted)]">Category</span>
            <Select value={stateFromUrl.category} onChange={(event) => navigateWithState({ search: search.trim(), category: event.target.value, page: 1 })} disabled={!categories.length} aria-label="Filter by category">
              <option value="">All Categories</option>
              {categories.map((category) => <option key={category.toLowerCase()} value={category}>{titleCase(category)}</option>)}
            </Select>
          </label>

          <label className="block min-w-0">
            <span className="mb-2 block text-xs font-medium text-[var(--muted)]">Sort by price</span>
            <Select value={stateFromUrl.sort} onChange={(event) => navigateWithState({ search: search.trim(), sort: event.target.value as SortOption, page: 1 })} aria-label="Sort services by price">
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </Select>
          </label>

          <Button type="button" variant="secondary" className="col-span-1 w-full sm:col-span-2 md:col-span-1 md:w-auto" onClick={resetFilters} disabled={!hasActiveFilters}>
            <RotateCcw className="size-4" aria-hidden="true" />Reset Filters
          </Button>
        </div>
      </section>

      <section aria-label="Salon service results" aria-busy={loading} className="mt-7">
        <div className="mb-5 flex min-h-8 flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-[var(--muted)]" aria-live="polite">{loading ? "Updating results…" : meta ? `Showing ${meta.total === 1 ? "1 service" : `${meta.total} services`}${hasActiveFilters ? ` of ${meta.activeTotal} active` : ""}` : ""}</p>
          {meta && meta.totalPages > 0 && <p className="text-xs text-[var(--muted)]">Page {meta.page} of {meta.totalPages}</p>}
        </div>

        {invalidQuery ? <div role="alert" className="rounded-2xl border border-red-900/60 bg-red-950/25 p-5 sm:p-6"><h2 className="font-semibold text-red-100">This service link has invalid filters</h2><p className="mt-1 text-sm leading-6 text-red-200/80">The link contains an unsupported sort, repeated filter, or invalid page number. Reset the filters to browse the menu.</p><Button variant="secondary" className="mt-4" onClick={resetFilters}>Reset filters</Button></div>
          : error ? <ErrorState description={error} onRetry={() => setRetry((value) => value + 1)} />
            : loading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-live="polite"><span className="sr-only">Loading salon services</span>{Array.from({ length: stateFromUrl.limit }, (_, index) => <ServiceCardSkeleton key={index} />)}</div>
              : services.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{services.map((service) => <ServiceCard key={service._id} service={service} />)}</div>
                : <EmptyState icon={<Scissors className="size-5" />} title={hasActiveFilters ? "No services match these filters" : "No active services yet"} description={hasActiveFilters ? "Try another service name or category, or reset your filters to see the full menu." : "The salon’s service menu will appear here when services are available."} action={hasActiveFilters ? <Button variant="secondary" onClick={resetFilters}>Reset filters</Button> : undefined} />}

        {!invalidQuery && !error && !loading && meta && meta.totalPages > 1 && <nav aria-label="Service result pages" className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-[var(--border)] pt-5 sm:flex-row">
          <p className="text-xs text-[var(--muted)]">{meta.total} matching {meta.total === 1 ? "service" : "services"}</p>
          <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
            <Button variant="secondary" size="sm" onClick={() => navigateWithState({ search: search.trim(), page: stateFromUrl.page - 1 })} disabled={stateFromUrl.page <= 1}><ArrowLeft className="size-4" aria-hidden="true" /><span>Previous</span></Button>
            <span className="min-w-20 text-center text-sm tabular-nums text-[var(--foreground)]" aria-current="page">{stateFromUrl.page} / {meta.totalPages}</span>
            <Button variant="secondary" size="sm" onClick={() => navigateWithState({ search: search.trim(), page: stateFromUrl.page + 1 })} disabled={stateFromUrl.page >= meta.totalPages}><span>Next</span><ArrowRight className="size-4" aria-hidden="true" /></Button>
          </div>
        </nav>}
      </section>
    </Container>
  </main>;
}

export function ServiceBrowserFallback() {
  return <main className="pb-16 sm:pb-20">
    <section className="border-b border-[var(--border)] bg-[var(--surface)] py-12 sm:py-16"><Container><p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--green-light)]">The SalonBook menu</p><h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Explore Our Services</h1><p className="mt-3 text-sm text-[var(--muted)] sm:text-base">Find the perfect salon service for your style, beauty, and personal care.</p><Skeleton className="mt-5 h-4 w-40" /></Container></section>
    <Container className="pt-7 sm:pt-9"><div className="grid grid-cols-1 gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-3 sm:grid-cols-2 sm:p-4 md:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-12" />)}</div><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <ServiceCardSkeleton key={index} />)}</div></Container>
  </main>;
}

function parseSort(value: string): SortOption | null {
  if (value === "default" || value === "name") return "default";
  if (value === "price-asc" || value === "price_asc") return "price-asc";
  if (value === "price-desc" || value === "price_desc") return "price-desc";
  return null;
}

function parsePositiveInteger(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function safeCount(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : fallback;
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toLocaleUpperCase());
}
