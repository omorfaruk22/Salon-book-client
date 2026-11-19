import { ArrowRight, CalendarClock, Scissors, Sparkles } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const steps = [
  { number: "01", title: "Explore Services", description: "Discover the services that match your needs.", icon: Scissors },
  { number: "02", title: "Choose Your Appointment", description: "Request your preferred date and time; the salon will confirm your visit.", icon: CalendarClock },
  { number: "03", title: "Enjoy Your Experience", description: "Visit the salon at your confirmed appointment and enjoy your selected service.", icon: Sparkles },
];

export function HowItWorksSection() {
  return <section aria-labelledby="how-it-works-title" className="py-16 sm:py-20 lg:py-24">
    <Container>
      <SectionHeading headingLevel="h2" headingId="how-it-works-title" eyebrow="Your visit, step by step" title="How SalonBook works" description="A straightforward way to find a service and send your appointment request." />
      <ol className="mt-9 grid gap-4 lg:mt-11 lg:grid-cols-3">
        {steps.map(({ number, title, description, icon: Icon }, index) => <li key={number} className="relative animate-fade-up rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] p-5 motion-reduce:animate-none sm:p-6" style={{ animationDelay: `${index * 80}ms` }}>
          {index < steps.length - 1 && <ArrowRight aria-hidden="true" className="absolute -right-3 top-1/2 z-10 hidden size-6 -translate-y-1/2 rounded-full border border-[var(--border)] bg-[var(--background)] p-1 text-[var(--green-light)] lg:block" />}
          <div className="flex items-center justify-between gap-4">
            <span className="grid size-12 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--green-light)]"><Icon className="size-5" aria-hidden="true" /></span>
            <span className="font-mono text-sm font-semibold tracking-[.18em] text-[var(--green-light)]">{number}</span>
          </div>
          <h3 className="mt-6 font-semibold text-[var(--foreground)]">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
        </li>)}
      </ol>
    </Container>
  </section>;
}
