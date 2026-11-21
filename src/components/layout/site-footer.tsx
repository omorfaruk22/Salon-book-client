"use client";

import Link from "next/link";
import { Clock3, Facebook, Instagram, MapPin, Phone, Youtube } from "lucide-react";
import { Container } from "@/components/ui/container";
import { useAuth } from "@/components/providers/auth-provider";
import { siteConfig } from "@/lib/site-config";

const socialIcons = { Facebook, Instagram, YouTube: Youtube };

export function SiteFooter() {
  const { user, isLoading } = useAuth();
  const accountLinks = isLoading ? [] : user?.role === "admin"
    ? [{ label: "Admin dashboard", href: "/admin" }]
    : user
      ? [{ label: "My appointments", href: "/appointments" }, { label: "My profile", href: "/profile" }]
      : [
          { label: "Sign in", href: "/sign-in" },
          { label: "Sign up", href: "/sign-up" },
          { label: "My appointments", href: "/sign-in?next=%2Fappointments" },
          { label: "My profile", href: "/sign-in?next=%2Fprofile" },
        ];

  return <footer className="mt-auto border-t border-[var(--border)] bg-[var(--background-raised)]">
    <Container className="py-12 sm:py-14">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.35fr_.8fr_.9fr_1fr] lg:gap-8">
        <section aria-labelledby="footer-brand-title" className="max-w-sm">
          <Link href="/" aria-label="SalonBook home" className="inline-flex items-center gap-2 text-xl font-bold tracking-tight focus-visible:rounded-lg">
            <span className="grid size-9 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--green-light)]"><span aria-hidden="true">S</span></span>
            <span id="footer-brand-title">Salon<span className="text-[var(--green-light)]">Book</span></span>
          </Link>
          <p className="mt-4 text-sm leading-6 text-[var(--muted)]">Explore salon services, request a preferred time, and keep your booking updates in one place.</p>
          <div className="mt-5 flex flex-wrap gap-2" aria-label="SalonBook social media">
            {siteConfig.socials.length ? siteConfig.socials.map(({ name, href }) => {
              const Icon = socialIcons[name as keyof typeof socialIcons];
              if (!Icon) return null;
              return <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={`SalonBook on ${name}`} className="grid size-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] transition-colors hover:border-[var(--green-light)]/50 hover:text-[var(--green-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)]"><Icon className="size-4" aria-hidden="true" /></a>;
            }) : <p className="text-xs text-[var(--muted)]">Social links will be added when official accounts are confirmed.</p>}
          </div>
        </section>

        <FooterColumn title="Explore" links={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: "About", href: "/about" },
          { label: "Contact", href: "/contact" },
        ]} />

        <FooterColumn title="Your account" links={accountLinks} loading={isLoading} />

        <section aria-labelledby="footer-contact-title">
          <h2 id="footer-contact-title" className="text-sm font-semibold text-[var(--foreground)]">Contact</h2>
          <ul className="mt-4 space-y-3 text-sm text-[var(--muted)]">
            {siteConfig.contactEmail && <li><a href={`mailto:${siteConfig.contactEmail}`} className="break-all transition-colors hover:text-[var(--green-light)] focus-visible:rounded-sm">{siteConfig.contactEmail}</a></li>}
            {siteConfig.contactPhone && <li className="flex items-start gap-2"><Phone className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><a href={`tel:${siteConfig.contactPhone.replace(/[^\d+]/g, "")}`} className="transition-colors hover:text-[var(--green-light)] focus-visible:rounded-sm">{siteConfig.contactPhone}</a></li>}
            {siteConfig.location && <li className="flex items-start gap-2"><MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span>{siteConfig.location}</span></li>}
            <li className="flex items-start gap-2"><Clock3 className="mt-0.5 size-4 shrink-0" aria-hidden="true" /><span><span className="font-medium text-[var(--foreground)]">Opening hours</span><br />{siteConfig.openingHours}</span></li>
            {!siteConfig.contactEmail && !siteConfig.contactPhone && !siteConfig.location && <li className="leading-6">Contact details will be added when confirmed.</li>}
          </ul>
          <Link href="/contact" className="mt-4 inline-flex min-h-10 items-center text-sm font-medium text-[var(--green-light)] transition-colors hover:text-white focus-visible:rounded-sm">Contact page <span className="sr-only">for more information</span></Link>
        </section>
      </div>

      <div className="mt-10 flex flex-col gap-4 border-t border-[var(--border)] pt-5 text-xs text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} SalonBook. All rights reserved.</p>
        <nav aria-label="Legal links" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/privacy" className="transition-colors hover:text-white focus-visible:rounded-sm">Privacy policy</Link>
          <Link href="/terms" className="transition-colors hover:text-white focus-visible:rounded-sm">Terms &amp; conditions</Link>
        </nav>
      </div>
    </Container>
  </footer>;
}

function FooterColumn({ title, links, loading = false }: { title: string; links: { label: string; href: string }[]; loading?: boolean }) {
  return <section aria-label={title}>
    <h2 className="text-sm font-semibold text-[var(--foreground)]">{title}</h2>
    {loading ? <div className="mt-4 min-h-20" aria-hidden="true" /> : <ul className="mt-4 space-y-3">
      {links.map((link) => <li key={`${link.label}-${link.href}`}><Link href={link.href} className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--green-light)] focus-visible:rounded-sm">{link.label}</Link></li>)}
    </ul>}
  </section>;
}
