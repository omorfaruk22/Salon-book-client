import { AdminServiceManager } from "@/features/services/components/admin-service-manager";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function AdminServicesPage() { return <main className="py-10 sm:py-14"><Container><SectionHeading eyebrow="Admin" title="Manage services" description="Maintain the salon menu, pricing, and availability." /><AdminServiceManager /></Container></main>; }

