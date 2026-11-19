import { TransactionHistory } from "@/features/appointments/components/transaction-history";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function PaymentHistoryPage() { return <main className="py-10 sm:py-14"><Container className="max-w-5xl"><SectionHeading eyebrow="Payments" title="Payment history" description="See payment updates for your salon appointments." /><TransactionHistory /></Container></main>; }

