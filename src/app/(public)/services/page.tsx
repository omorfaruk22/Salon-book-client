import { ServiceBrowser } from "@/features/services/components/service-browser";
export default function ServicesPage() {
  return <main className="mx-auto max-w-6xl px-6 py-16"><p className="text-sm font-semibold uppercase tracking-[.2em] text-[var(--green-light)]">Our menu</p><h1 className="mt-3 text-4xl font-semibold">Salon services</h1><p className="mt-4 max-w-2xl text-[var(--muted)]">Find the right care for your next visit. Compare services, durations, and prices.</p><ServiceBrowser /></main>;
}
