"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api-client";
import type { ApiEnvelope } from "@/types/service";
import type { SalonAppointment } from "@/types/appointment";

export function AppointmentRequestForm({ serviceId }: { serviceId: string }) {
  const router = useRouter();
  const [startsAt, setStartsAt] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const minDate = new Date(Date.now() + 60 * 60 * 1000 - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 16);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await apiFetch("/appointments", { method: "POST", body: JSON.stringify({ serviceId, startsAt: new Date(startsAt).toISOString(), customerNote: customerNote.trim() || undefined }) });
      const result = (await response.json()) as ApiEnvelope<SalonAppointment>;
      if (!response.ok) throw new Error(result.error?.message ?? "Could not request this appointment.");
      router.push("/appointments"); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Please sign in and try again."); }
    finally { setBusy(false); }
  }

  return <section className="mt-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
    <h2 className="text-lg font-semibold">Request an appointment</h2><p className="mt-1 text-sm text-[var(--muted)]">Choose a preferred start time. The salon will confirm your request.</p>
    <form onSubmit={submit} className="mt-4 space-y-4">
      <label className="block space-y-2 text-sm"><span>Preferred date and time</span><input type="datetime-local" min={minDate} required value={startsAt} onChange={(event) => setStartsAt(event.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-white [color-scheme:dark]" /></label>
      <label className="block space-y-2 text-sm"><span>Note for the salon <span className="text-[var(--muted)]">(optional)</span></span><textarea maxLength={500} rows={3} value={customerNote} onChange={(event) => setCustomerNote(event.target.value)} className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 outline-none focus:border-[var(--green-light)]" /></label>
      {error && <p role="alert" className="rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">{error} {error.toLowerCase().includes("sign in") && <Link href="/login" className="underline">Sign in</Link>}</p>}
      <button disabled={busy} className="w-full rounded-xl bg-[var(--primary)] px-5 py-3 font-semibold hover:bg-[var(--primary-hover)] disabled:opacity-60">{busy ? "Sending request…" : "Request appointment"}</button>
    </form>
  </section>;
}
