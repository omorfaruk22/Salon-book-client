import { Suspense } from "react";
import { PaymentSuccess } from "@/features/appointments/components/payment-success";

export default async function PaymentSuccessPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id: sessionId = "" } = await searchParams;
  return <Suspense fallback={<main className="mx-auto max-w-3xl px-5 py-16 text-center text-[var(--muted)]">Loading payment status…</main>}><PaymentSuccess sessionId={sessionId} /></Suspense>;
}
