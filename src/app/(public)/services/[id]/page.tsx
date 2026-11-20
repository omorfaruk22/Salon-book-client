import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { AppointmentRequestForm } from "@/features/appointments/components/appointment-request-form";
import { RelatedServices } from "@/features/services/components/related-services";
import { ServiceAppointmentSection, ServiceBookingPanel } from "@/features/services/components/service-booking-panel";
import { ServiceDetailsImage } from "@/features/services/components/service-details-image";
import { ServiceDetailsFailure } from "@/features/services/components/service-details-failure";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { serverApiUrl } from "@/lib/server-api-url";
import { formatBDTPrice, formatServiceDuration } from "@/lib/service-format";
import type { ApiEnvelope, SalonService } from "@/types/service";

type ServicePageProps = { params: Promise<{ id: string }> };
type ServiceResponse = ApiEnvelope<SalonService>;
type LoadedService = { status: number; service: SalonService | null };

const loadService = cache(async (id: string): Promise<LoadedService> => {
  try {
    const response = await fetch(serverApiUrl(`/services/${encodeURIComponent(id)}`), { cache: "no-store" });
    const result = await response.json().catch(() => null) as ServiceResponse | null;
    const service = response.ok && result?.data && result.data.isActive ? result.data : null;
    return { status: response.ok && result?.data && !result.data.isActive ? 404 : response.status, service };
  } catch {
    return { status: 0, service: null };
  }
});

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { id } = await params;
  const { service } = await loadService(id);
  if (!service) {
    return { title: "Service Details", robots: { index: false, follow: true } };
  }

  const description = service.description.trim().slice(0, 160);
  return {
    title: service.name,
    description,
    alternates: { canonical: `/services/${service._id}` },
    openGraph: {
      title: `${service.name} | SalonBook`,
      description,
      type: "website",
      ...(service.imageUrl ? { images: [{ url: service.imageUrl, alt: `${service.name} salon service` }] } : {}),
    },
  };
}

export default async function ServiceDetailsPage({ params }: ServicePageProps) {
  const { id } = await params;
  const { status, service } = await loadService(id);

  if (status === 404 || (service && !service.isActive)) notFound();
  if (status === 400) {
    return <ServiceRouteMessage title="Invalid service link" description="This link does not contain a valid service ID. Browse the service menu to choose an available service." />;
  }
  if (!service) return <ServiceDetailsFailure />;

  return (
    <main className="pb-16 pt-8 sm:pb-20 sm:pt-12">
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
          <AppointmentRequestForm serviceId={service._id} />
        </ServiceAppointmentSection>

        <RelatedServices service={service} />
      </Container>
    </main>
  );
}

function ServiceRouteMessage({ title, description }: { title: string; description: string }) {
  return (
    <main className="py-16 sm:py-24">
      <Container className="max-w-2xl text-center">
        <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--green-light)]">SalonBook service menu</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--muted)]">{description}</p>
        <Button asChild className="mt-7"><Link href="/services">Browse Services</Link></Button>
      </Container>
    </main>
  );
}
