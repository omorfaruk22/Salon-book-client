"use client";

import Link from "next/link";
import { Search, Scissors } from "lucide-react";
import { useEffect, useState } from "react";
import type { ApiEnvelope, SalonService } from "@/types/service";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const money = new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 });

export function ServiceBrowser() {
  const [services, setServices] = useState<SalonService[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("name");
  const [loading, setLoading] = useState(true);
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
        const response = await fetch(`${apiBase}/services?${params}`, { signal: controller.signal, cache: "no-store" });
        const result = (await response.json()) as ApiEnvelope<SalonService[]>;
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
  }, [search, category, sort]);

  return <section>
    <div className="mt-8 grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 md:grid-cols-[1fr_220px_220px]">
      <label className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4"><Search size={18} className="text-[var(--muted)]" /><span className="sr-only">Search services</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search services" className="w-full bg-transparent py-3 text-sm outline-none placeholder:text-[var(--muted)]" /></label>
      <label className="sr-only" htmlFor="service-category">Filter by category</label><select id="service-category" value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm"><option value="">All categories</option>{categories.map((item) => <option key={item} value={item}>{titleCase(item)}</option>)}</select>
      <label className="sr-only" htmlFor="service-sort">Sort services</label><select id="service-sort" value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm"><option value="name">Name</option><option value="price_asc">Price: low to high</option><option value="price_desc">Price: high to low</option></select>
    </div>
    {error && <p role="alert" className="mt-6 rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-red-200">{error}</p>}
    {loading ? <p className="py-16 text-center text-[var(--muted)]">Loading salon services…</p> : services.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{services.map((service) => <ServiceCard key={service._id} service={service} />)}</div> : !error && <div className="mt-8 rounded-2xl border border-dashed border-[var(--border)] px-6 py-16 text-center"><Scissors className="mx-auto text-[var(--green-light)]" /><h2 className="mt-4 text-xl font-semibold">No services found</h2><p className="mt-2 text-sm text-[var(--muted)]">Try a different search or category.</p></div>}
  </section>;
}

function ServiceCard({ service }: { service: SalonService }) {
  return <article className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition hover:-translate-y-1 hover:border-[var(--primary)]/70">
    {service.imageUrl ? <img src={service.imageUrl} alt="" className="h-48 w-full object-cover" /> : <div className="flex h-48 items-center justify-center bg-gradient-to-br from-[var(--surface)] to-[var(--primary)]/20"><Scissors className="text-[var(--green-light)]" size={34} /></div>}
    <div className="p-5"><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-[var(--primary)]/15 px-3 py-1 text-xs font-medium capitalize text-[var(--green-light)]">{service.category}</span><span className="text-xs text-[var(--muted)]">{service.durationMinutes} min</span></div>
      <h2 className="mt-4 text-xl font-semibold">{service.name}</h2><p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[var(--muted)]">{service.description}</p>
      <div className="mt-5 flex items-center justify-between"><strong className="text-lg">{money.format(service.price)}</strong><Link href={`/services/${service.slug}`} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-medium hover:border-[var(--green-light)] hover:text-[var(--green-light)]">Details</Link></div>
    </div>
  </article>;
}

function titleCase(value: string) { return value.replace(/\b\w/g, (letter) => letter.toUpperCase()); }
