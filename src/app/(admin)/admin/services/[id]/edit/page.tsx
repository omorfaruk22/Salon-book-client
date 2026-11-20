import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { AdminServiceForm } from "@/features/services/components/admin-service-form";

export default async function EditAdminServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <main className="py-10 sm:py-14"><Container>
    <SectionHeading eyebrow="Admin · Service catalog" title="Edit service" description="Update the service details customers see when they browse and book." />
    <AdminServiceForm serviceId={id} />
  </Container></main>;
}
