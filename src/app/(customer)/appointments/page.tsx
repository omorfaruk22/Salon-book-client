import Link from "next/link";
import { CustomerAppointments } from "@/features/appointments/components/customer-appointments";
export default function AppointmentsPage() { return <main className="mx-auto max-w-5xl p-6 md:p-8"><p className="text-sm font-semibold uppercase tracking-[.2em] text-[var(--green-light)]">Your bookings</p><h1 className="mt-3 text-3xl font-semibold">Appointments</h1><p className="mt-2 text-[var(--muted)]">Check request updates and manage upcoming visits.</p><CustomerAppointments /><Link href="/services" className="mt-6 inline-flex text-sm font-medium text-[var(--green-light)] hover:underline">Browse services</Link></main>; }

