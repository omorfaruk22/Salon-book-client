import { Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/lib/site-config";

export default function ContactPage() {
  const hasDetails = Boolean(siteConfig.contactEmail || siteConfig.contactPhone || siteConfig.location);

  return <main className="py-12 sm:py-16">
    <Container className="max-w-5xl">
      <SectionHeading eyebrow="Contact" title="Get in touch" description="Find the salon’s confirmed contact details here when they are available." />
      <section aria-label="Salon contact details" className="mt-8 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
        {hasDetails ? <ul className="space-y-5">
          {siteConfig.contactEmail && <li className="flex items-start gap-3 text-sm"><Mail className="mt-0.5 size-5 shrink-0 text-[var(--green-light)]" aria-hidden="true" /><a href={`mailto:${siteConfig.contactEmail}`} className="break-all text-[var(--muted)] transition-colors hover:text-white">{siteConfig.contactEmail}</a></li>}
          {siteConfig.contactPhone && <li className="flex items-start gap-3 text-sm"><Phone className="mt-0.5 size-5 shrink-0 text-[var(--green-light)]" aria-hidden="true" /><a href={`tel:${siteConfig.contactPhone.replace(/[^\d+]/g, "")}`} className="text-[var(--muted)] transition-colors hover:text-white">{siteConfig.contactPhone}</a></li>}
          {siteConfig.location && <li className="flex items-start gap-3 text-sm"><MapPin className="mt-0.5 size-5 shrink-0 text-[var(--green-light)]" aria-hidden="true" /><span className="text-[var(--muted)]">{siteConfig.location}</span></li>}
        </ul> : <p className="max-w-2xl text-sm leading-7 text-[var(--muted)]">Public email, phone, and location details have not been provided yet. This page will show them after the salon confirms the information.</p>}
      </section>
    </Container>
  </main>;
}
