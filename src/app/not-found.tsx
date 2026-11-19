import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function NotFound() {
  return (
    <Container className="flex min-h-[65vh] items-center justify-center py-16">
      <div className="max-w-lg text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--green-light)]"><SearchX aria-hidden="true" /></span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[.24em] text-[var(--green-light)]">404 · Page not found</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">This page isn’t here.</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">The link may be outdated, or the page may have moved. Head back to SalonBook and continue browsing.</p>
        <Button asChild className="mt-7"><Link href="/"><ArrowLeft className="size-4" />Go to home</Link></Button>
      </div>
    </Container>
  );
}
