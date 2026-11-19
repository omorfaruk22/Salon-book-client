import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { HomeJourneyButton } from "@/features/home/components/home-journey-button";

export function HomeCtaSection() {
  return <section aria-labelledby="home-cta-title" className="pb-16 sm:pb-20 lg:pb-24">
    <Container>
      <div className="relative isolate overflow-hidden rounded-[var(--radius-card)] border border-[var(--green-light)]/20 bg-[var(--card)] px-5 py-10 sm:px-9 sm:py-12 lg:px-12 lg:py-14">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_85%_40%,rgb(22_163_74_/_20%),transparent_48%),linear-gradient(115deg,#151d18,#111714)]" />
        <div className="mx-auto max-w-3xl text-center">
          <span className="mx-auto grid size-11 place-items-center rounded-xl border border-[var(--green-light)]/20 bg-[var(--primary)]/10 text-[var(--green-light)]"><Sparkles className="size-5" aria-hidden="true" /></span>
          <h2 id="home-cta-title" className="mt-5 text-balance text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">Ready for Your Next Salon Experience?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[var(--muted)] sm:text-base sm:leading-7">Explore our services and find the right appointment for you.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg"><Link href="/services">Explore Services<ArrowRight className="size-4" aria-hidden="true" /></Link></Button>
            <HomeJourneyButton variant="secondary" />
          </div>
        </div>
      </div>
    </Container>
  </section>;
}
