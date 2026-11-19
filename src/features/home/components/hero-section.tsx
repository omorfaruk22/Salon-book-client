import Link from "next/link";
import { ArrowRight, CalendarCheck2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HomeJourneyButton } from "@/features/home/components/home-journey-button";
import { SalonHeroImage } from "@/features/home/components/salon-hero-image";

export function HeroSection() {
  return <section className="relative isolate overflow-hidden border-b border-[var(--border)]">
    <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_30%,rgb(22_163_74_/_14%),transparent_38%),radial-gradient(ellipse_at_12%_5%,rgb(34_197_94_/_7%),transparent_33%)]" />
    <Container className="grid items-center gap-10 py-12 sm:gap-14 sm:py-16 lg:min-h-[min(760px,calc(100svh-4.25rem))] lg:grid-cols-[1.04fr_.96fr] lg:gap-12 lg:py-20">
      <div className="animate-fade-up max-w-2xl">
        <p className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)]/85 px-3.5 py-2 text-[11px] font-semibold uppercase tracking-[.19em] text-[var(--green-light)] sm:text-xs"><Sparkles className="size-3.5" aria-hidden="true" />Your Beauty, Our Priority</p>
        <h1 className="mt-6 max-w-2xl text-balance text-[2.55rem] font-semibold leading-[1.08] tracking-[-.045em] sm:mt-7 sm:text-5xl lg:text-[3.7rem] xl:text-[4.1rem]">Discover Your <span className="text-[var(--green-light)]">Perfect Salon</span> Experience</h1>
        <p className="mt-5 max-w-xl text-sm leading-7 text-[var(--muted)] sm:mt-6 sm:text-base sm:leading-8">Book trusted salon professionals, explore premium beauty services, and enjoy a personalized experience designed around you.</p>
        <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg" className="w-full sm:w-auto"><Link href="/services">Explore Services<ArrowRight className="size-4" aria-hidden="true" /></Link></Button>
          <HomeJourneyButton className="w-full sm:w-auto" />
        </div>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[var(--muted)] sm:mt-9 sm:text-sm">
          <span className="inline-flex items-center gap-2"><span className="grid size-7 place-items-center rounded-lg bg-[var(--primary)]/12 text-[var(--green-light)]"><CalendarCheck2 className="size-4" aria-hidden="true" /></span>Request a time that works for you</span>
          <span className="inline-flex items-center gap-2"><span className="size-1.5 rounded-full bg-[var(--green-light)]" />Follow booking updates in your account</span>
        </div>
      </div>
      <SalonHeroImage />
    </Container>
  </section>;
}
