import { DashboardOverview } from "@/features/appointments/components/dashboard-overview";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function CustomerDashboardPage() { return <main className="py-10 sm:py-14"><Container><SectionHeading eyebrow="SalonBook" title="Your dashboard" description="A quick look at your bookings and payments." /><DashboardOverview /></Container></main>; }

