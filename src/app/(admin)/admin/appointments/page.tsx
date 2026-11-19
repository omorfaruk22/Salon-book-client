import { AdminAppointments } from "@/features/appointments/components/admin-appointments";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function AdminAppointmentsPage() { return <main className="py-10 sm:py-14"><Container><SectionHeading eyebrow="Admin" title="Manage appointments" description="Review new requests and keep the appointment schedule up to date." /><AdminAppointments /></Container></main>; }

