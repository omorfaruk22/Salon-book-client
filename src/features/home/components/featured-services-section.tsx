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
import { apiUrl } from "@/lib/api-url";
import type { ApiEnvelope, SalonService } from "@/types/service";

type FeaturedServicesResponse = ApiEnvelope<SalonService[]>;

export function FeaturedServicesSection() {
  const [services, setServices] = useState<SalonService[]>([]);
  const [apiCategories, setApiCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function loadServices() {
      setLoading(true);
      setError("");
      try {
        const query = new URLSearchParams({ page: "1", limit: "48", sort: "name" });
        const response = await fetch(apiUrl(`/services?${query.toString()}`), { cache: "no-store", signal: controller.signal });
        const result = await response.json().catch(() => null) as FeaturedServicesResponse | null;
        if (!response.ok || !result || !Array.isArray(result.data)) {
          throw new Error("We couldn't load the salon's services. Please try again.");
        }
        setServices(result.data.filter((service) => service.isActive));
        const categories = result.meta?.categories?.filter((category) => typeof category === "string" && category.trim()) ?? [];
        setApiCategories(categories);
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
        {error ? <ErrorState className="mt-8" description={error} onRetry={() => setRetryCount((count) => count + 1)} /> : loading ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading featured salon services" aria-busy="true">{Array.from({ length: 6 }, (_, index) => <ServiceCardSkeleton key={index} />)}</div> : services.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{services.slice(0, 6).map((service) => <ServiceCard key={service._id} service={service} />)}</div> : <div className="mt-8"><EmptyState icon={<Scissors className="size-5" />} title="No active services yet" description="The salon’s service list will appear here when services are available." /></div>}
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
