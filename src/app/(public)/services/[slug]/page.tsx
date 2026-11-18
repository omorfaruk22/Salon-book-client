import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock3, Scissors } from "lucide-react";
import type { ApiEnvelope, SalonService } from "@/types/service";
import { AppointmentRequestForm } from "@/features/appointments/components/appointment-request-form";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const money = new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 });

export default async function ServiceDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const response = await fetch(`${apiBase}/services/${encodeURIComponent(slug)}`, { cache: "no-store" });
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Could not load this salon service.");
  const result = (await response.json()) as ApiEnvelope<SalonService>;
  const service = result.data;

  return <main className="mx-auto max-w-5xl px-6 py-12">
    <Link href="/services" className="inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--green-light)]"><ArrowLeft size={16} /> All services</Link>
    <article className="mt-8 grid overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] md:grid-cols-2">
      {service.imageUrl ? <img src={service.imageUrl} alt={service.name} className="h-full min-h-72 w-full object-cover" /> : <div className="flex min-h-72 items-center justify-center bg-gradient-to-br from-[var(--surface)] to-[var(--primary)]/20"><Scissors size={48} className="text-[var(--green-light)]" /></div>}
      <div className="p-7 md:p-10"><span className="rounded-full bg-[var(--primary)]/15 px-3 py-1 text-xs font-medium capitalize text-[var(--green-light)]">{service.category}</span><h1 className="mt-5 text-3xl font-semibold">{service.name}</h1><p className="mt-5 leading-7 text-[var(--muted)]">{service.description}</p>
        <div className="mt-8 flex items-center gap-2 text-sm text-[var(--muted)]"><Clock3 size={17} /> {service.durationMinutes} minutes</div>
        <div className="mt-5 border-t border-[var(--border)] pt-5"><span className="text-sm text-[var(--muted)]">Starting from</span><p className="mt-1 text-3xl font-semibold">{money.format(service.price)}</p></div>
        <AppointmentRequestForm serviceId={service._id} />
      </div>
    </article>
  </main>;
}
