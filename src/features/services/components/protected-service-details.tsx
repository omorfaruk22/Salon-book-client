"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { AppointmentRequestForm } from "@/features/appointments/components/appointment-request-form";
import { RelatedServices } from "@/features/services/components/related-services";
import { ServiceAppointmentSection, ServiceBookingPanel } from "@/features/services/components/service-booking-panel";
import { ServiceDetailsImage } from "@/features/services/components/service-details-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ErrorState } from "@/components/ui/error-state";
import { apiFetch } from "@/lib/api-client";
import { formatBDTPrice, formatServiceDuration, getSalonCalendarDate } from "@/lib/service-format";
import type { ApiEnvelope, SalonService } from "@/types/service";

type ServiceDetailsResponse = ApiEnvelope<SalonService>;

export function ProtectedServiceDetails({ serviceId }: { serviceId: string }) {
  const [service, setService] = useState<SalonService | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setNotFound(false);
    setError(false);

    async function loadService() {
      try {
        const response = await apiFetch(`/services/${encodeURIComponent(serviceId)}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = await response.json().catch(() => null) as ServiceDetailsResponse | null;
        if (controller.signal.aborted) return;
        if (response.status === 404 || response.status === 400) {
          setNotFound(true);
          return;
        }
        if (!response.ok || !result?.data || !result.data.isActive) {
          setError(true);
          return;
        }
        setService(result.data);
      } catch {
        if (!controller.signal.aborted) setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    void loadService();
    return () => controller.abort();
  }, [retryCount, serviceId]);

  if (loading) return <main className="mx-auto min-h-[50vh] max-w-6xl px-6 py-10" role="status" aria-busy="true" aria-label="Loading service details">
    <div aria-hidden="true" className="animate-pulse space-y-6">
      <div className="h-4 w-48 rounded bg-[var(--card)]" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,.75fr)]">
        <div className="h-[30rem] rounded-3xl border border-[var(--border)] bg-[var(--card)]" />
        <div className="h-72 rounded-3xl border border-[var(--border)] bg-[var(--card)]" />
      </div>
    </div>
  </main>;

  if (notFound) return <main className="py-16 sm:py-24"><Container className="max-w-2xl text-center">
    <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--green-light)]">SalonBook service menu</p>
    <h1 className="mt-3 text-3xl font-semibold tracking-tight">Service not found</h1>
    <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">This service is no longer available. Browse the menu to see current services.</p>
    <Button asChild className="mt-7"><Link href="/services">Browse Services</Link></Button>
  </Container></main>;

  if (error || !service) return <main className="py-16 sm:py-24"><Container className="max-w-3xl">
    <ErrorState
      title="Service details are temporarily unavailable"
      description="We couldn’t reach the service menu. Check your connection and try again."
      onRetry={() => setRetryCount((count) => count + 1)}
    />
    <p className="mt-4 text-center text-sm text-[var(--muted)]">You can also <Link href="/services" className="text-[var(--green-light)] underline underline-offset-4 hover:text-[var(--green-soft)]">browse all services</Link>.</p>
  </Container></main>;

  return <main className="pb-16 pt-8 sm:pb-20 sm:pt-12">
    <Container className="max-w-6xl">
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-[var(--muted)]">
          <li><Link href="/" className="inline-flex min-h-9 items-center gap-1.5 rounded-md transition hover:text-[var(--green-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)]"><Home className="size-4" aria-hidden="true" />Home</Link></li>
          <li aria-hidden="true"><ChevronRight className="size-4" /></li>
          <li><Link href="/services" className="inline-flex min-h-9 items-center rounded-md transition hover:text-[var(--green-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)]">Services</Link></li>
          <li aria-hidden="true"><ChevronRight className="size-4" /></li>
          <li className="max-w-[12rem] truncate text-[var(--foreground)] sm:max-w-sm" aria-current="page">{service.name}</li>
        </ol>
      </nav>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,.75fr)] lg:gap-7">
        <article className="min-w-0 overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] shadow-[0_25px_80px_rgb(0_0_0_/_20%)]">
          <ServiceDetailsImage imageUrl={service.imageUrl} name={service.name} />
          <div className="p-5 sm:p-7 lg:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="default">{service.category}</Badge>
              <Badge variant="success"><span className="size-1.5 rounded-full bg-emerald-300" aria-hidden="true" />Available to book</Badge>
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">{service.name}</h1>
            <p className="mt-5 whitespace-pre-line break-words text-sm leading-7 text-[var(--muted)] sm:text-base sm:leading-8">{service.description}</p>
            <dl className="mt-7 grid grid-cols-1 gap-3 border-t border-[var(--border)] pt-5 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <dt className="text-xs font-medium text-[var(--muted)]">Price</dt>
                <dd className="mt-1 text-xl font-semibold tabular-nums">{formatBDTPrice(service.price)}</dd>
              </div>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                <dt className="text-xs font-medium text-[var(--muted)]">Duration</dt>
                <dd className="mt-1 text-base font-semibold">{formatServiceDuration(service.durationMinutes)}</dd>
              </div>
            </dl>
          </div>
        </article>

        <ServiceBookingPanel service={service} />
      </div>

      <ServiceAppointmentSection>
        <AppointmentRequestForm service={service} initialDate={getSalonCalendarDate()} />
      </ServiceAppointmentSection>

      <RelatedServices service={service} />
    </Container>
  </main>;
}
