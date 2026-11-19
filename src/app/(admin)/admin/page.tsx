import { DashboardOverview } from "@/features/appointments/components/dashboard-overview";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function AdminDashboardPage() { return <main className="py-10 sm:py-14"><Container><SectionHeading eyebrow="SalonBook · Admin" title="Admin overview" description="Review bookings, services, customers, and paid revenue." /><DashboardOverview admin /></Container></main>; }

