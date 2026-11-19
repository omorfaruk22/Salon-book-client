import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function AboutPage() {
  return <main className="py-12 sm:py-16">
    <Container className="max-w-5xl">
      <SectionHeading eyebrow="About SalonBook" title="A simpler way to plan your salon visit" description="SalonBook brings service information, appointment requests, and booking updates together in one place." />
      <section className="mt-8 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
        <h2 className="text-lg font-semibold">How it works</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">Browse the services currently listed, choose a preferred appointment time, and follow the request from your account. The salon confirms appointment requests before customers pay.</p>
      </section>
    </Container>
  </main>;
}
