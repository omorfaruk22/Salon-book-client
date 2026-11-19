import Link from "next/link";
import { CustomerAppointments } from "@/features/appointments/components/customer-appointments";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function AppointmentsPage() { return <main className="py-10 sm:py-14"><Container className="max-w-5xl"><SectionHeading eyebrow="Your bookings" title="Appointments" description="Check request updates and manage upcoming visits." /><CustomerAppointments /><Link href="/services" className="mt-6 inline-flex min-h-10 items-center text-sm font-medium text-[var(--green-light)] hover:underline">Browse services</Link></Container></main>; }

