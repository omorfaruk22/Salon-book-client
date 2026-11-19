import { SiteShell } from "@/components/layout/site-shell";
import Link from "next/link";
import { ArrowRight, CalendarCheck2, CreditCard, Scissors, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

export default function HomePage() {
  return <SiteShell>
    <section className="relative isolate overflow-hidden border-b border-[var(--border)]">
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_72%_35%,rgb(22_163_74_/_18%),transparent_32%),radial-gradient(ellipse_at_15%_0%,rgb(34_197_94_/_8%),transparent_30%)]" />
      <Container className="grid min-h-[min(760px,calc(100svh-4.25rem))] items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:py-24">
        <div className="animate-fade-up max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)]/80 px-3.5 py-2 text-xs font-semibold uppercase tracking-[.18em] text-[var(--green-light)]"><Sparkles className="size-3.5" aria-hidden="true" />Your salon, on your schedule</p>
          <h1 className="mt-7 text-balance text-4xl font-semibold tracking-[-.04em] sm:text-5xl lg:text-6xl">Make time for <span className="text-[var(--green-light)]">feeling your best.</span></h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-[var(--muted)] sm:text-lg sm:leading-8">Explore salon services, request a time that works for you, and keep every booking in one place.</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg"><Link href="/services">Explore services <ArrowRight className="size-4" aria-hidden="true" /></Link></Button>
            <Button asChild variant="secondary" size="lg"><Link href="/register">Create an account</Link></Button>
          </div>
          <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs text-[var(--muted)] sm:text-sm"><span className="inline-flex items-center gap-2"><span className="size-1.5 rounded-full bg-[var(--green-light)]" />Simple service browsing</span><span className="inline-flex items-center gap-2"><span className="size-1.5 rounded-full bg-[var(--green-light)]" />Appointment updates</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-lg animate-fade-up animation-delay-100">
          <div aria-hidden="true" className="absolute -inset-4 rounded-[2rem] bg-[var(--primary)]/10 blur-2xl" />
          <div className="relative rounded-[2rem] border border-[var(--border)] bg-[linear-gradient(145deg,#151d18,#0e1310)] p-5 shadow-[0_30px_100px_rgb(0_0_0_/_40%)] sm:p-7">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-5"><div><p className="text-xs uppercase tracking-[.18em] text-[var(--muted)]">Your next visit</p><p className="mt-1 font-semibold">One easy booking flow</p></div><span className="grid size-11 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--background)] text-[var(--green-light)]"><Scissors className="size-5" /></span></div>
            <div className="mt-5 space-y-3">
              <FeatureRow icon={<Scissors className="size-4" />} step="01" title="Choose a service" detail="Browse the salon menu" />
              <FeatureRow icon={<CalendarCheck2 className="size-4" />} step="02" title="Request a time" detail="The salon confirms your visit" />
              <FeatureRow icon={<CreditCard className="size-4" />} step="03" title="Manage and pay" detail="Track updates in your account" />
            </div>
            <Link href="/services" className="mt-5 flex items-center justify-between rounded-xl border border-[var(--primary)]/25 bg-[var(--primary)]/10 px-4 py-3 text-sm font-medium text-[var(--green-soft)] transition hover:bg-[var(--primary)]/15"><span>See available services</span><ArrowRight className="size-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </Container>
    </section>
    <section className="py-16 sm:py-20">
      <Container>
        <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--green-light)]">A smoother visit</p><h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Everything you need before you take a seat.</h2><p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:text-base">Start with the service menu and use your account to follow each request through confirmation and payment.</p></div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3"><Benefit icon={<Scissors className="size-5" />} title="Explore services" text="Compare service descriptions, duration, and price." /><Benefit icon={<CalendarCheck2 className="size-5" />} title="Request appointments" text="Send a preferred time and check the salon’s response." /><Benefit icon={<CreditCard className="size-5" />} title="Track payments" text="Pay for confirmed bookings and review transaction history." /></div>
      </Container>
    </section>
  </SiteShell>;
}

function FeatureRow({ icon, step, title, detail }: { icon: React.ReactNode; step: string; title: string; detail: string }) {
  return <div className="flex items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--background)]/70 p-4"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--primary)]/15 text-[var(--green-light)]">{icon}</span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="text-sm font-semibold">{title}</h2><span className="text-[10px] font-semibold tracking-wider text-[var(--muted)]">{step}</span></div><p className="mt-1 text-xs text-[var(--muted)]">{detail}</p></div></div>;
}

function Benefit({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <article className="rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6"><span className="grid size-11 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--green-light)]">{icon}</span><h3 className="mt-5 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-[var(--muted)]">{text}</p></article>;
}
