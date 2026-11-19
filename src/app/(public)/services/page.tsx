import { ServiceBrowser } from "@/features/services/components/service-browser";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function ServicesPage() {
  return <main className="py-12 sm:py-16"><Container><SectionHeading eyebrow="Our menu" title="Salon services" description="Find the right care for your next visit. Compare services, durations, and prices." /><ServiceBrowser /></Container></main>;
}
