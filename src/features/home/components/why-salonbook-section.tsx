import { CalendarCheck2, HeartHandshake, Sparkles, UserRoundCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const benefits = [
  { title: "Easy Online Booking", description: "Send an appointment request from the service you choose, whenever it suits you.", icon: CalendarCheck2 },
  { title: "Trusted Salon Services", description: "Review clear service descriptions, prices, and durations before making a choice.", icon: HeartHandshake },
  { title: "Professional Experience", description: "Use a clean, organized service menu to plan the salon visit that feels right for you.", icon: Sparkles },
  { title: "Convenient Appointment Management", description: "Keep appointment updates and payment history together in your account.", icon: UserRoundCheck },
];

export function WhySalonBookSection() {
  return <section aria-labelledby="why-salonbook-title" className="border-y border-[var(--border)] bg-[var(--surface)]/45 py-16 sm:py-20 lg:py-24">
    <Container>
      <SectionHeading headingLevel="h2" headingId="why-salonbook-title" eyebrow="Made for your next visit" title="A simpler way to plan your salon visit" description="From exploring the menu to following your appointment, SalonBook keeps the essentials easy to find." />
      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:mt-11 lg:grid-cols-4">
        {benefits.map(({ title, description, icon: Icon }, index) => <article key={title} className="animate-fade-up group rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] p-5 transition duration-200 hover:-translate-y-1 hover:border-[var(--green-light)]/45 motion-reduce:animate-none motion-reduce:transition-none sm:p-6" style={{ animationDelay: `${index * 70}ms` }}>
          <span className="grid size-11 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--green-light)] transition-colors group-hover:border-[var(--green-light)]/35 group-hover:bg-[var(--primary)]/10"><Icon className="size-5" aria-hidden="true" /></span>
          <h3 className="mt-5 font-semibold text-[var(--foreground)]">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
        </article>)}
      </div>
    </Container>
  </section>;
}
