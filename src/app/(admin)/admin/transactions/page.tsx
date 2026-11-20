import { AdminTransactionManager } from "@/features/admin/components/admin-transaction-manager";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function AdminTransactionsPage() { return <main className="py-2 sm:py-4"><Container><SectionHeading eyebrow="Admin" title="Transactions" description="Review Stripe-verified customer payments, filter records, and open transaction details." /><div className="mt-8"><AdminTransactionManager /></div></Container></main>; }

