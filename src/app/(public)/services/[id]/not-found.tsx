import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function ServiceNotFound() {
  return (
    <main className="py-16 sm:py-24">
      <Container className="max-w-2xl text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--green-light)]"><SearchX aria-hidden="true" /></span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[.22em] text-[var(--green-light)]">Service unavailable</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">We couldn’t find this service.</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--muted)]">It may have been removed or is no longer available to book. Browse the current service menu to find another option.</p>
        <Button asChild className="mt-7"><Link href="/services"><ArrowLeft className="size-4" aria-hidden="true" />Back to Services</Link></Button>
      </Container>
    </main>
  );
}
