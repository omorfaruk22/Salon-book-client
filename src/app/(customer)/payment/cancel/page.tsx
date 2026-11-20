import { PaymentCancel } from "@/features/appointments/components/payment-cancel";

export default async function PaymentCancelPage({ searchParams }: { searchParams: Promise<{ appointment_id?: string }> }) {
  const { appointment_id: appointmentId = "" } = await searchParams;
  return <PaymentCancel appointmentId={appointmentId} />;
}
