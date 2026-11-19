"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("SalonBook page error:", error);
  }, [error]);

  return (
    <Container className="flex min-h-[65vh] items-center justify-center py-16">
      <div role="alert" className="max-w-lg rounded-[var(--radius-card)] border border-red-900/50 bg-[var(--surface)] p-7 text-center sm:p-10">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl border border-red-900/60 bg-red-950/30 text-red-200"><AlertTriangle aria-hidden="true" /></span>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[.24em] text-red-200">Something went wrong</p>
        <h1 className="mt-3 text-2xl font-semibold">We couldn’t load this page.</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Please try again. If the issue continues, return to the home page and try later.</p>
        {error.digest && <p className="mt-3 text-xs text-[var(--muted)]">Reference: {error.digest}</p>}
        <Button className="mt-7" onClick={reset}><RotateCcw className="size-4" />Try again</Button>
      </div>
    </Container>
  );
}
