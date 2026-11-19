import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function TermsPage() {
  return <main className="py-12 sm:py-16">
    <Container className="max-w-4xl">
      <SectionHeading eyebrow="Terms" title="Terms & conditions" description="This page is reserved for the SalonBook terms." />
      <p className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-sm leading-7 text-[var(--muted)]">Terms text has not been provided yet. This placeholder does not establish or describe any terms of service.</p>
    </Container>
  </main>;
}
