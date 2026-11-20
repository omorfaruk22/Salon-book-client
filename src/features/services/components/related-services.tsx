"use client";

import { useEffect, useMemo, useState } from "react";
import { Scissors } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { ServiceCard } from "@/components/ui/service-card";
import { ServiceCardSkeleton } from "@/components/ui/skeleton";
import { apiUrl } from "@/lib/api-url";
import type { ApiEnvelope, SalonService } from "@/types/service";

export function RelatedServices({ service }: { service: SalonService }) {
  const [services, setServices] = useState<SalonService[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedServiceId, setLoadedServiceId] = useState("");
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function loadRelated() {
      setLoading(true);
      setError(false);
      try {
        const response = await fetch(apiUrl("/services?page=1&limit=48"), { cache: "no-store", signal: controller.signal });
        const result = await response.json().catch(() => null) as ApiEnvelope<SalonService[]> | null;
        if (!response.ok || !result || !Array.isArray(result.data)) throw new Error("Related services are unavailable");
        setServices(result.data.filter((item) => item.isActive && item._id !== service._id));
        setLoadedServiceId(service._id);
      } catch {
        if (!controller.signal.aborted) {
          setServices([]);
          setError(true);
          setLoadedServiceId(service._id);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void loadRelated();
    return () => controller.abort();
  }, [retry, service._id]);

  const related = useMemo(() => {
    const category = service.category.trim().toLocaleLowerCase();
    const sameCategory = services.filter((item) => item.category.trim().toLocaleLowerCase() === category);
    const otherCategories = services.filter((item) => item.category.trim().toLocaleLowerCase() !== category);
    return [...sameCategory, ...otherCategories].slice(0, 3);
  }, [service.category, services]);
  const isLoading = loading || loadedServiceId !== service._id;

  return (
    <section aria-labelledby="related-services-title" className="mt-14 sm:mt-16">
      <SectionHeading headingLevel="h2" headingId="related-services-title" eyebrow="Keep exploring" title="You May Also Like" description="More active services from the SalonBook menu." />
      <div className="mt-6" aria-busy={isLoading}>
        {isLoading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" role="status"><span className="sr-only">Loading related services</span>{Array.from({ length: 3 }, (_, index) => <ServiceCardSkeleton key={index} />)}</div>
          : error ? <ErrorState title="Related services couldn’t load" description="The service menu is temporarily unavailable. Try again in a moment." onRetry={() => setRetry((value) => value + 1)} />
            : related.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((item) => <ServiceCard key={item._id} service={item} />)}</div>
              : <EmptyState icon={<Scissors className="size-5" aria-hidden="true" />} title="No related services yet" description="Check back later as the salon adds more services to its menu." />}
      </div>
    </section>
  );
}
