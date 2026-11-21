import type { Metadata } from "next";
import { AuthGate } from "@/components/layout/auth-gate";
import { ProtectedServiceDetails } from "@/features/services/components/protected-service-details";

export const metadata: Metadata = {
  title: "Service Details | SalonBook",
  description: "Sign in to view detailed salon service information and booking options.",
  robots: { index: false, follow: false },
};

export default async function ServiceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AuthGate role="authenticated"><ProtectedServiceDetails serviceId={id} /></AuthGate>;
}
