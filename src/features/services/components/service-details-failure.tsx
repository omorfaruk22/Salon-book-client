"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { ErrorState } from "@/components/ui/error-state";

export function ServiceDetailsFailure() {
  const router = useRouter();
  return (
    <main className="py-16 sm:py-24">
      <Container className="max-w-3xl">
        <ErrorState
          title="Service details are temporarily unavailable"
          description="We couldn’t reach the service menu. Check your connection and try again."
          onRetry={() => router.refresh()}
        />
        <p className="mt-4 text-center text-sm text-[var(--muted)]">You can also <Link href="/services" className="text-[var(--green-light)] underline underline-offset-4 hover:text-[var(--green-soft)]">browse all services</Link>.</p>
      </Container>
    </main>
  );
}
