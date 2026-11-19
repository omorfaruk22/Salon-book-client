import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function PrivacyPage() {
  return <main className="py-12 sm:py-16">
    <Container className="max-w-4xl">
      <SectionHeading eyebrow="Privacy" title="Privacy policy" description="This page is reserved for the SalonBook privacy notice." />
      <p className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 text-sm leading-7 text-[var(--muted)]">Privacy policy text has not been provided yet. This placeholder does not describe or promise any privacy practices.</p>
    </Container>
  </main>;
}
