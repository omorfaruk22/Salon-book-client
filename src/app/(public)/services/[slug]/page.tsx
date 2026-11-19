import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, Scissors } from "lucide-react";
import type { ApiEnvelope, SalonService } from "@/types/service";
import { AppointmentRequestForm } from "@/features/appointments/components/appointment-request-form";
import Image from "next/image";
import { Container } from "@/components/ui/container";

// This page is a Server Component, so its fetch needs an absolute backend URL.
// NEXT_PUBLIC_API_URL is `/api` in production for browser requests and is not
// a valid URL when used directly by server-side fetch.
const apiBase = `${(process.env.SALONBOOK_API_ORIGIN ?? "http://localhost:4000").replace(/\/+$/, "")}/api`;
const money = new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 });

export default async function ServiceDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const response = await fetch(`${apiBase}/services/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Could not load this salon service.");
  const result = (await response.json()) as ApiEnvelope<SalonService>;
  const service = result.data;

  return <main className="py-10 sm:py-14">
    <Container className="max-w-6xl">
    <Link href="/services" className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm text-[var(--muted)] transition hover:text-[var(--green-light)]"><ArrowLeft size={16} /> All services</Link>
    <article className="mt-6 grid overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] shadow-[0_25px_80px_rgb(0_0_0_/_20%)] md:grid-cols-[.9fr_1.1fr]">
      {service.imageUrl ? <Image src={service.imageUrl} alt={service.name} width={900} height={1100} unoptimized priority className="h-72 w-full bg-[var(--surface)] object-cover md:h-full md:min-h-[42rem]" /> : <div className="flex min-h-72 items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgb(34_197_94_/_15%),transparent_48%),linear-gradient(135deg,#111714,#151d18)] md:min-h-[42rem]"><Scissors size={48} className="text-[var(--green-light)]" /></div>}
      <div className="p-5 sm:p-8 md:p-10"><span className="inline-flex rounded-full bg-[var(--primary)]/15 px-3 py-1 text-xs font-semibold capitalize text-[var(--green-light)]">{service.category}</span><h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">{service.name}</h1><p className="mt-5 whitespace-pre-line text-sm leading-7 text-[var(--muted)] sm:text-base">{service.description}</p>
        <div className="mt-8 flex items-center gap-2 text-sm text-[var(--muted)]"><Clock3 size={17} /> {service.durationMinutes} minutes</div>
        <div className="mt-5 border-t border-[var(--border)] pt-5"><span className="text-sm text-[var(--muted)]">Starting from</span><p className="mt-1 text-3xl font-semibold">{money.format(service.price)}</p></div>
        <AppointmentRequestForm serviceId={service._id} />
      </div>
    </article>
    </Container>
  </main>;
}
