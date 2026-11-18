import { SiteShell } from "@/components/layout/site-shell";
export default function HomePage() {
  return <SiteShell><section className="mx-auto max-w-6xl px-6 py-24"><p className="text-sm font-semibold uppercase tracking-[.25em] text-[var(--green-light)]">SalonBook</p><h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight">Your next great hair day starts here.</h1><p className="mt-5 max-w-xl text-[var(--muted)]">Explore salon services and plan your visit with confidence.</p><a className="mt-8 inline-flex rounded-full bg-[var(--primary)] px-6 py-3 font-medium hover:bg-[var(--primary-hover)]" href="/services">Explore services</a></section></SiteShell>;
}
