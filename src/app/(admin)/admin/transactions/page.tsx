import { TransactionHistory } from "@/features/appointments/components/transaction-history";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function AdminTransactionsPage() { return <main className="py-10 sm:py-14"><Container><SectionHeading eyebrow="Admin" title="Transactions" description="Review customer payment records." /><TransactionHistory admin /></Container></main>; }

