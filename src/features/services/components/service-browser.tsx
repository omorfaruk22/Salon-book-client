"use client";

import { Search, Scissors } from "lucide-react";
import { useEffect, useState } from "react";
import type { ApiEnvelope, SalonService } from "@/types/service";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ServiceCard } from "@/components/ui/service-card";
import { ServiceCardSkeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { apiUrl } from "@/lib/api-url";

export function ServiceBrowser() {
  const [services, setServices] = useState<SalonService[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(() => typeof window === "undefined" ? "" : new URLSearchParams(window.location.search).get("category") ?? "");
  const [sort, setSort] = useState("name");
  const [loading, setLoading] = useState(true);
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      const params = new URLSearchParams({ page: "1", limit: "24", sort });
      if (search.trim()) params.set("q", search.trim());
      if (category) params.set("category", category);
      try {
        const response = await fetch(apiUrl(`/services?${params}`), { signal: controller.signal, cache: "no-store" });
        const result = await response.json().catch(() => null) as ApiEnvelope<SalonService[]> | null;
        if (!result) throw new Error("The service server returned an unreadable response. Please try again.");
        if (!response.ok) throw new Error(result.error?.message ?? "Could not load services.");
        setServices(result.data);
        setCategories(result.meta?.categories ?? []);
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load services.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 180);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [search, category, sort, retry]);

  return <section aria-label="Browse salon services">
    <div className="mt-8 grid gap-3 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-3 sm:p-4 md:grid-cols-[minmax(0,1fr)_220px_220px]">
      <label className="relative"><span className="sr-only">Search services</span><Search size={17} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]" /><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search services" className="pl-11" /></label>
      <label><span className="sr-only">Filter by category</span><Select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">All categories</option>{categories.map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</Select></label>
      <label><span className="sr-only">Sort services</span><Select value={sort} onChange={(event) => setSort(event.target.value)}><option value="name">Sort: name</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></Select></label>
    </div>
    {error ? <ErrorState className="mt-6" description={error} onRetry={() => setRetry((value) => value + 1)} /> : loading ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading salon services">{Array.from({ length: 6 }, (_, index) => <ServiceCardSkeleton key={index} />)}</div> : services.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{services.map((service) => <ServiceCard key={service._id} service={service} />)}</div> : <div className="mt-8"><EmptyState icon={<Scissors className="size-5" />} title="No services found" description="Try a different search or category." /></div>}
  </section>;
}

function titleCase(value: string) { return value.replace(/\b\w/g, (letter) => letter.toUpperCase()); }
