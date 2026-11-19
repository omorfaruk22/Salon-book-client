import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Clock3, Scissors } from "lucide-react";
import type { SalonService } from "@/types/service";
import { Badge } from "@/components/ui/badge";

const money = new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 });

export function ServiceCard({ service }: { service: SalonService }) {
  return (
    <article className="group overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] transition duration-200 hover:-translate-y-1 hover:border-[var(--green-light)]/45 hover:shadow-[0_18px_50px_rgb(0_0_0_/_22%)] motion-reduce:transition-none">
      <Link href={`/services/${service.slug}`} className="block focus-visible:rounded-[var(--radius-card)]" aria-label={`View ${service.name} service details`}>
        {service.imageUrl ? (
          <Image src={service.imageUrl} alt={service.name} width={720} height={480} unoptimized loading="lazy" className="h-48 w-full bg-[var(--surface)] object-cover transition duration-500 group-hover:scale-[1.025] motion-reduce:transition-none" />
        ) : (
          <div className="flex h-48 items-center justify-center bg-[radial-gradient(circle_at_50%_35%,rgb(34_197_94_/_15%),transparent_48%),linear-gradient(135deg,#111714,#151d18)]">
            <Scissors className="size-9 text-[var(--green-light)]/80" strokeWidth={1.4} aria-hidden="true" />
          </div>
        )}
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <Badge variant="neutral">{service.category}</Badge>
            <span className="inline-flex items-center gap-1.5 text-xs text-[var(--muted)]"><Clock3 className="size-3.5" aria-hidden="true" />{service.durationMinutes} min</span>
          </div>
          <h2 className="mt-4 text-lg font-semibold tracking-tight group-hover:text-[var(--green-soft)]">{service.name}</h2>
          <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[var(--muted)]">{service.description}</p>
          <div className="mt-5 flex items-end justify-between gap-3 border-t border-[var(--border)] pt-4">
            <div><span className="block text-[11px] text-[var(--muted)]">Starting from</span><strong className="mt-0.5 block text-lg font-semibold">{money.format(service.price)}</strong></div>
            <span className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-xs font-semibold text-[var(--foreground)] transition group-hover:border-[var(--green-light)]/50 group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--green-light)]">View details <ArrowUpRight className="size-4" aria-hidden="true" /></span>
          </div>
        </div>
      </Link>
    </article>
  );
}
