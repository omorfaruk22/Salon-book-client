"use client";

import { useState } from "react";
import { CreditCard, LoaderCircle, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import type { ApiEnvelope } from "@/types/service";
import { useToast } from "@/components/providers/toast-provider";

type CheckoutResponse = { url?: string; processing?: boolean; sessionId?: string };

export function AppointmentPaymentAction({ appointmentId, compact = false }: { appointmentId: string; compact?: boolean }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function startCheckout() {
    if (loading) return;
    setLoading(true);
    try {
      const response = await apiFetch("/transactions/checkout-session", {
        method: "POST",
        body: JSON.stringify({ appointmentId }),
      });
      const result = await response.json().catch(() => null) as ApiEnvelope<CheckoutResponse> | null;
      if (!response.ok || !result?.data) throw new Error(result?.error?.message ?? "Could not start Stripe Checkout.");
      if (result.data.url) { window.location.assign(result.data.url); return; }
      if (result.data.processing && result.data.sessionId) {
        window.location.assign(`/payment/success?session_id=${encodeURIComponent(result.data.sessionId)}`);
        return;
      }
      throw new Error("Stripe did not return a checkout session. Please try again.");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not start Stripe Checkout.", "error");
      setLoading(false);
    }
  }

  return <div className={compact ? "flex flex-col items-start gap-1" : "space-y-2"}>
    <button type="button" onClick={() => void startCheckout()} disabled={loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)] disabled:cursor-wait disabled:opacity-60">
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <CreditCard className="size-4" aria-hidden="true" />}
      {loading ? "Opening secure checkout…" : "Pay now"}
    </button>
    {!compact && <p className="inline-flex items-center gap-1 text-xs text-[var(--muted)]"><ShieldCheck className="size-3.5 text-[var(--green-light)]" aria-hidden="true" />Secure payment handled by Stripe</p>}
  </div>;
}
