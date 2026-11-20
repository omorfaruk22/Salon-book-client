import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminServiceManager } from "@/features/services/components/admin-service-manager";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function AdminServicesPage() {
  return <main className="py-10 sm:py-14"><Container>
    <SectionHeading eyebrow="Admin" title="Manage Services" description="Manage your salon services and keep your service catalog updated."
      action={<Button asChild><Link href="/admin/services/new"><Plus className="size-4" />Add New Service</Link></Button>} />
    <AdminServiceManager />
  </Container></main>;
}
