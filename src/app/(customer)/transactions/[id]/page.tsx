import { Container } from "@/components/ui/container";
import { TransactionReceipt } from "@/features/appointments/components/transaction-receipt";

export default async function TransactionReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <main className="py-10 sm:py-14"><Container><TransactionReceipt transactionId={id} /></Container></main>;
}
