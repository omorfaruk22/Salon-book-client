"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Droplets, Flower2, HandHeart, Palette, Scissors, Sparkles } from "lucide-react";
import { CategoryCard } from "@/components/ui/category-card";
import { Container } from "@/components/ui/container";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { ServiceCard } from "@/components/ui/service-card";
import { ServiceCardSkeleton, Skeleton } from "@/components/ui/skeleton";
import { apiBaseUrl, apiUrl } from "@/lib/api-url";
import { isTransientHttpStatus, retryTransient } from "@/lib/retry-transient";
import type { ApiEnvelope, SalonService } from "@/types/service";

type FeaturedServicesResponse = ApiEnvelope<SalonService[]>;
type CachedServiceMenu = { services: SalonService[]; categories: string[] };
const serviceMenuCacheKey = `salonbook:service-menu:v1:${apiBaseUrl}`;

export function FeaturedServicesSection() {
  const [services, setServices] = useState<SalonService[]>([]);
  const [apiCategories, setApiCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showingSavedServices, setShowingSavedServices] = useState(false);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const cachedMenu = readCachedServiceMenu();
    if (cachedMenu) {
      setServices(cachedMenu.services);
      setApiCategories(cachedMenu.categories);
      setLoading(false);
      setShowingSavedServices(true);
    }

    async function loadServices() {
      setLoading(!cachedMenu);
      setError("");
      try {
        const query = new URLSearchParams({ page: "1", limit: "48", sort: "name" });
        const response = await retryTransient(
          () => fetch(apiUrl(`/services?${query.toString()}`), { cache: "no-store", signal: controller.signal }),
          (item) => isTransientHttpStatus(item.status),
          controller.signal,
        );
        const result = await response.json().catch(() => null) as FeaturedServicesResponse | null;
        if (!response.ok || !result || !Array.isArray(result.data)) {
          throw new Error("We couldn't load the salon's services. Please try again.");
        }
        const activeServices = result.data.filter((service) => service.isActive);
        const categories = result.meta?.categories?.filter((category) => typeof category === "string" && category.trim()) ?? [];
        setServices(activeServices);
        setApiCategories(categories);
        setShowingSavedServices(false);
        try {
          window.localStorage.setItem(serviceMenuCacheKey, JSON.stringify({ services: activeServices, categories } satisfies CachedServiceMenu));
        } catch {
          // Keep the live service list usable when browser storage is unavailable.
        }
      } catch {
        if (!controller.signal.aborted) setError("The service list is temporarily unavailable. Please retry in a moment.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadServices();
    return () => controller.abort();
  }, [retryCount]);

  const categories = useMemo(() => {
    const categoryNames = apiCategories.length ? apiCategories : services.map((service) => service.category);
    const unique = new Map<string, string>();
    for (const category of categoryNames) {
      const label = category.trim();
      const key = label.toLocaleLowerCase();
      if (label && !unique.has(key)) unique.set(key, label);
    }
    return Array.from(unique.values()).sort((first, second) => first.localeCompare(second));
  }, [apiCategories, services]);

  return <>
    <section aria-labelledby="featured-services-title" className="py-16 sm:py-20 lg:py-24">
      <Container>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading headingLevel="h2" headingId="featured-services-title" eyebrow="The service menu" title="Explore Our Premium Services" description="Discover services designed to help you look and feel your best." />
          <Link href="/services" className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold text-[var(--green-light)] transition-colors hover:text-white focus-visible:rounded-md">Browse all services<ArrowRight className="size-4" aria-hidden="true" /></Link>
        </div>
        {error && !services.length ? <ErrorState className="mt-8" description={error} onRetry={() => setRetryCount((count) => count + 1)} /> : loading && !services.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading featured salon services" aria-busy="true">{Array.from({ length: 6 }, (_, index) => <ServiceCardSkeleton key={index} />)}</div> : services.length ? <>
          {showingSavedServices && <p role="status" className="mt-6 rounded-xl border border-amber-800/50 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">Showing the last saved service list while we reconnect. Prices and availability may be outdated.</p>}
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{services.slice(0, 6).map((service) => <ServiceCard key={service._id} service={service} />)}</div>
        </> : <div className="mt-8"><EmptyState icon={<Scissors className="size-5" />} title="No active services yet" description="The salon’s service list will appear here when services are available." /></div>}
      </Container>
    </section>

    <section aria-labelledby="categories-title" className="border-y border-[var(--border)] bg-[var(--surface)]/50 py-16 sm:py-20">
      <Container>
        <SectionHeading headingLevel="h2" headingId="categories-title" eyebrow="Find what fits" title="Explore by Category" description="Choose a category to see the salon services currently listed for it." />
        {loading ? <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-label="Loading service categories" aria-busy="true">{Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-44 rounded-[var(--radius-card)]" />)}</div> : categories.length ? <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">{categories.map((category) => <CategoryCard key={category.toLocaleLowerCase()} title={titleCase(category)} description={`Browse available ${category.toLocaleLowerCase()} services.`} href={`/services?${new URLSearchParams({ category }).toString()}`} icon={<CategoryIcon category={category} />} />)}</div> : <div className="mt-8"><EmptyState icon={<Sparkles className="size-5" />} title="Categories will appear here" description="Once active salon services are listed, you can explore them by category." /></div>}
      </Container>
    </section>
  </>;
}

function CategoryIcon({ category }: { category: string }) {
  const name = category.toLocaleLowerCase();
  if (/hair|cut|style|treatment/.test(name)) return <Scissors className="size-5" aria-hidden="true" />;
  if (/skin|facial|care/.test(name)) return <Droplets className="size-5" aria-hidden="true" />;
  if (/makeup|colour|color/.test(name)) return <Palette className="size-5" aria-hidden="true" />;
  if (/nail|hand|foot/.test(name)) return <HandHeart className="size-5" aria-hidden="true" />;
  return <Flower2 className="size-5" aria-hidden="true" />;
}

function titleCase(value: string) {
  return value.replace(/\b\w/g, (letter) => letter.toLocaleUpperCase());
}

function readCachedServiceMenu(): CachedServiceMenu | null {
  try {
    const cached = window.localStorage.getItem(serviceMenuCacheKey);
    if (!cached) return null;
    const parsed: unknown = JSON.parse(cached);
    if (!parsed || typeof parsed !== "object" || !("services" in parsed) || !("categories" in parsed)) return null;
    const candidate = parsed as { services: unknown; categories: unknown };
    if (!Array.isArray(candidate.services) || !Array.isArray(candidate.categories)) return null;
    const services = candidate.services.filter(isCachedService);
    const categories = candidate.categories.filter((category): category is string => typeof category === "string" && Boolean(category.trim()));
    return { services, categories };
  } catch {
    return null;
  }
}

function isCachedService(value: unknown): value is SalonService {
  if (!value || typeof value !== "object") return false;
  const service = value as Record<string, unknown>;
  return typeof service._id === "string"
    && typeof service.name === "string"
    && typeof service.description === "string"
    && typeof service.category === "string"
    && typeof service.durationMinutes === "number"
    && typeof service.price === "number"
    && typeof service.isActive === "boolean";
}
