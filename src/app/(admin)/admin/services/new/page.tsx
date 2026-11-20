import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { AdminServiceForm } from "@/features/services/components/admin-service-form";

export default function NewAdminServicePage() {
  return <main className="py-10 sm:py-14"><Container>
    <SectionHeading eyebrow="Admin · Service catalog" title="Add a service" description="Create a salon service with clear pricing, duration, and a hosted image." />
    <AdminServiceForm />
  </Container></main>;
}
