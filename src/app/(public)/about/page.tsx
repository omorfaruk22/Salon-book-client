import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Check } from "lucide-react";

const highlights = [
  {
    title: "Know what you’re booking",
    description: "Compare service details, duration, and pricing before choosing your visit.",
  },
  {
    title: "Request a time that suits you",
    description: "Send your appointment request online and let the salon confirm the schedule.",
  },
  {
    title: "Keep every update in one place",
    description: "Use your customer dashboard to check appointment status and manage upcoming visits.",
  },
  {
    title: "Pay after confirmation",
    description: "Complete payment through Stripe Checkout after your appointment is confirmed, then revisit your payment history and receipt.",
  },
];

export default function AboutPage() {
  return <main className="py-12 sm:py-16">
    <Container className="max-w-5xl">
      <SectionHeading eyebrow="About SalonBook" title="A simpler way to plan your salon visit" description="SalonBook brings service information, appointment requests, and booking updates together in one place." />
      <section className="mt-8" aria-labelledby="about-highlights-title">
        <h2 id="about-highlights-title" className="text-xl font-semibold tracking-tight">Made for easier salon bookings</h2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {highlights.map((item) => <li key={item.title} className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--primary)]/15 text-[var(--green-light)]"><Check className="size-5" aria-hidden="true" /></span>
            <div><h3 className="font-semibold">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{item.description}</p></div>
          </li>)}
        </ul>
      </section>
      <section className="mt-8 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
        <h2 className="text-lg font-semibold">How it works</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted)]">Browse the services currently listed, choose a preferred appointment time, and follow the request from your account. The salon confirms appointment requests before customers pay.</p>
      </section>
    </Container>
  </main>;
}
