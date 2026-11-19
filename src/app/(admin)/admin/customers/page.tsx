import { AdminCustomerManager } from "@/features/auth/components/admin-customer-manager";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function AdminCustomersPage() { return <main className="py-10 sm:py-14"><Container><SectionHeading eyebrow="Admin" title="Manage customers" description="Search customer accounts and manage access." /><AdminCustomerManager /></Container></main>; }

