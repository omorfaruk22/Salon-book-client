"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, ShieldCheck } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBDTPrice, formatServiceDuration } from "@/lib/service-format";
import type { SalonService } from "@/types/service";

export function ServiceBookingPanel({ service }: { service: SalonService }) {
  const { user, isLoading, profileError } = useAuth();
  const signInHref = `/sign-in?next=${encodeURIComponent(`/services/${service._id}`)}`;

  return (
    <aside aria-labelledby="booking-panel-title" className="self-start lg:sticky lg:top-24">
      <div className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_20px_60px_rgb(0_0_0_/_18%)] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.18em] text-[var(--green-light)]">Booking information</p>
            <h2 id="booking-panel-title" className="mt-2 text-xl font-semibold">Reserve this service</h2>
          </div>
          <Badge variant="success"><span className="size-1.5 rounded-full bg-emerald-300" aria-hidden="true" />Available</Badge>
        </div>

        <p className="mt-6 text-3xl font-semibold tabular-nums">{formatBDTPrice(service.price)}</p>
        <dl className="mt-5 space-y-4 border-t border-[var(--border)] pt-5 text-sm">
          <div className="flex items-center justify-between gap-3"><dt className="inline-flex items-center gap-2 text-[var(--muted)]"><Clock3 className="size-4" aria-hidden="true" />Duration</dt><dd className="text-right font-medium">{formatServiceDuration(service.durationMinutes)}</dd></div>
          <div className="flex items-center justify-between gap-3"><dt className="inline-flex items-center gap-2 text-[var(--muted)]"><CalendarDays className="size-4" aria-hidden="true" />Category</dt><dd className="max-w-[55%] text-right font-medium capitalize">{service.category}</dd></div>
        </dl>

        <div className="mt-6">
          {isLoading ? <Skeleton className="h-12 w-full rounded-xl" aria-label="Checking your account" />
            : profileError ? <p role="status" className="rounded-xl border border-amber-800/60 bg-amber-950/25 p-3 text-sm leading-6 text-amber-100">We couldn’t verify your account. Refresh this page before booking.</p>
              : user?.role === "customer" ? <Button asChild className="w-full" size="lg"><a href="#appointment-request">Book This Service<ArrowRight className="size-4" aria-hidden="true" /></a></Button>
                : user?.role === "admin" ? <div className="space-y-3"><p className="text-sm leading-6 text-[var(--muted)]">Admin accounts can manage appointments from the dashboard, but cannot book as a customer.</p><Button asChild variant="secondary" className="w-full"><Link href="/admin">Open Admin Dashboard<ArrowRight className="size-4" aria-hidden="true" /></Link></Button></div>
                  : <Button asChild className="w-full" size="lg"><Link href={signInHref}>Book This Service<ArrowRight className="size-4" aria-hidden="true" /></Link></Button>}
        </div>

        <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[var(--muted)]"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-[var(--green-light)]" aria-hidden="true" />Your request is sent to the salon for confirmation.</p>
      </div>
    </aside>
  );
}

export function ServiceAppointmentSection({ children }: { children: ReactNode }) {
  const { user, isLoading, profileError } = useAuth();
  if (isLoading) return <div id="appointment-request" className="mt-6 scroll-mt-28" aria-live="polite"><Skeleton className="h-72 rounded-2xl" aria-label="Preparing appointment request" /></div>;
  if (profileError || user?.role !== "customer") return null;

  return <div className="mt-6">{children}</div>;
}
