"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/providers/toast-provider";
import { apiFetch } from "@/lib/api-client";
import { formatBDTPrice, formatServiceDuration, SALON_TIME_ZONE } from "@/lib/service-format";
import type { AppointmentAvailability, SalonAppointment } from "@/types/appointment";
import type { ApiEnvelope, SalonService } from "@/types/service";

type AppointmentRequestFormProps = { service: SalonService; initialDate: string };

export function AppointmentRequestForm({ service, initialDate }: AppointmentRequestFormProps) {
  const toast = useToast();
  const [appointmentDate, setAppointmentDate] = useState(initialDate);
  const [timeSlot, setTimeSlot] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [availability, setAvailability] = useState<AppointmentAvailability | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(true);
  const [availabilityError, setAvailabilityError] = useState("");
  const [retry, setRetry] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [createdAppointment, setCreatedAppointment] = useState<SalonAppointment | null>(null);
  const signInHref = `/sign-in?next=${encodeURIComponent(`/services/${service._id}`)}`;

  useEffect(() => {
    const controller = new AbortController();
    async function loadAvailability() {
      setAvailabilityLoading(true);
      setAvailabilityError("");
      setAvailability(null);
      setTimeSlot("");
      try {
        const query = new URLSearchParams({ serviceId: service._id, date: appointmentDate });
        const response = await apiFetch(`/appointments/availability?${query.toString()}`, { signal: controller.signal, cache: "no-store" });
        const result = await response.json().catch(() => null) as ApiEnvelope<AppointmentAvailability> | null;
        if (!response.ok || !result?.data) throw new Error(result?.error?.message ?? "Could not load appointment availability.");
        setAvailability(result.data);
      } catch (cause) {
        if (!controller.signal.aborted) {
          setAvailabilityError(cause instanceof Error ? cause.message : "Could not load appointment availability.");
        }
      } finally {
        if (!controller.signal.aborted) setAvailabilityLoading(false);
      }
    }
    void loadAvailability();
    return () => controller.abort();
  }, [appointmentDate, retry, service._id]);

  const selectedSlot = useMemo(() => availability?.slots.find((slot) => slot.value === timeSlot && slot.available) ?? null, [availability, timeSlot]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedSlot || availability?.date !== appointmentDate || busy || availabilityLoading || availabilityError) return;
    setBusy(true);
    setError("");
    try {
      const response = await apiFetch("/appointments", {
        method: "POST",
        body: JSON.stringify({ serviceId: service._id, appointmentDate, timeSlot: selectedSlot.value, customerNote: customerNote.trim() || undefined }),
      });
      const result = await response.json().catch(() => null) as ApiEnvelope<SalonAppointment> | null;
      if (!response.ok || !result?.data) throw new Error(result?.error?.message ?? "Could not request this appointment.");
      setCreatedAppointment(result.data);
      toast("Appointment request sent to the salon.", "success");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not request this appointment.";
      setError(message);
      toast(message, "error");
      if (message.toLowerCase().includes("available") || message.includes("just booked")) setRetry((value) => value + 1);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section id="appointment-request" className="scroll-mt-28 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-7" aria-labelledby="appointment-request-title">
      {createdAppointment ? <BookingConfirmation appointment={createdAppointment} timeZone={availability?.timeZone ?? SALON_TIME_ZONE} /> : <>
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-[var(--green-light)]">Choose your visit</p>
          <h2 id="appointment-request-title" className="mt-2 text-2xl font-semibold">Request an appointment</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Select an available time. The salon will review and confirm your request.</p>
        </div>

        <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:flex-row sm:items-center">
          {service.imageUrl ? <Image src={service.imageUrl} alt={`${service.name} service`} width={112} height={88} unoptimized className="h-24 w-full rounded-xl object-cover sm:w-28" />
            : <div className="grid h-24 w-full place-items-center rounded-xl bg-[radial-gradient(circle_at_50%_35%,rgb(34_197_94_/_15%),transparent_48%),linear-gradient(135deg,#111714,#151d18)] sm:w-28"><Scissors className="size-7 text-[var(--green-light)]" aria-hidden="true" /></div>}
          <div className="min-w-0">
            <p className="text-xs font-medium capitalize text-[var(--green-light)]">{service.category}</p>
            <h3 className="mt-1 break-words text-lg font-semibold">{service.name}</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">{formatBDTPrice(service.price)} <span aria-hidden="true">·</span> {formatServiceDuration(service.durationMinutes)}</p>
          </div>
        </div>

        <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-6" aria-busy={busy}>
          <label className="block max-w-sm space-y-2 text-sm font-medium">
            <span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-[var(--green-light)]" aria-hidden="true" />Appointment date</span>
            <input type="date" min={initialDate} required value={appointmentDate} onChange={(event) => { setAppointmentDate(event.target.value); setAvailability(null); setAvailabilityLoading(true); setTimeSlot(""); setError(""); }} className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] [color-scheme:dark] focus:border-[var(--green-light)] focus:outline-none focus:ring-2 focus:ring-[var(--green-light)]/30" />
          </label>

          <fieldset aria-describedby="time-slot-help">
            <legend className="inline-flex items-center gap-2 text-sm font-medium"><Clock3 className="size-4 text-[var(--green-light)]" aria-hidden="true" />Available time slots</legend>
            <p id="time-slot-help" className="mt-1 text-xs leading-5 text-[var(--muted)]">Times are shown in {availability?.timeZone ?? SALON_TIME_ZONE}.</p>
            {availabilityLoading ? <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">{Array.from({ length: 8 }, (_, index) => <Skeleton key={index} className="h-12 rounded-xl" />)}</div>
              : availabilityError ? <div className="mt-4 space-y-3"><ErrorState title="Could not load time slots" description={availabilityError} onRetry={() => { setAvailabilityLoading(true); setRetry((value) => value + 1); }} />{availabilityError.toLowerCase().includes("session") && <p className="text-sm text-[var(--muted)]"><Link className="text-[var(--green-light)] underline" href={signInHref}>Sign in again</Link> to continue booking.</p>}</div>
                : availability?.slots.some((slot) => slot.available) ? <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Choose an available appointment time">
                  {availability.slots.map((slot) => <label key={slot.value} className={`flex min-h-12 items-center gap-3 rounded-xl border px-3 py-2 text-sm transition focus-within:ring-2 focus-within:ring-[var(--green-light)]/50 motion-reduce:transition-none ${slot.available ? "cursor-pointer border-[var(--border)] bg-[var(--background)] hover:border-[var(--green-light)]/60" : "cursor-not-allowed border-[var(--border)]/60 bg-[var(--background)]/50 text-[var(--muted)] opacity-65"} ${timeSlot === slot.value ? "border-[var(--green-light)] bg-[var(--primary)]/10 text-[var(--green-soft)]" : ""}`}>
                    <input type="radio" name="appointment-time" value={slot.value} checked={timeSlot === slot.value} disabled={!slot.available || busy} onChange={() => { setTimeSlot(slot.value); setError(""); }} className="size-4 accent-[var(--primary)]" aria-label={`${slot.label}${slot.available ? ", available" : `, unavailable: ${reasonLabel(slot.reason)}`}`} />
                    <span className="min-w-0 flex-1 font-medium">{slot.label}</span>
                    <span className={`shrink-0 text-[11px] font-medium ${slot.available ? "text-[var(--green-light)]" : "text-[var(--muted)]"}`}>{slot.available ? "Available" : reasonLabel(slot.reason)}</span>
                  </label>)}
                </div>
                : <p className="mt-4 rounded-xl border border-dashed border-[var(--border)] p-4 text-sm leading-6 text-[var(--muted)]">No appointment times are available on this date. Choose another date.</p>}
          </fieldset>

          <label className="block space-y-2 text-sm font-medium">
            <span>Message for the salon <span className="font-normal text-[var(--muted)]">(optional, up to 500 characters)</span></span>
            <textarea maxLength={500} rows={3} value={customerNote} onChange={(event) => setCustomerNote(event.target.value)} placeholder="Share any instructions for your visit" className="w-full rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--green-light)] focus:ring-2 focus:ring-[var(--green-light)]/30" />
            <span className="block text-right text-xs text-[var(--muted)]">{customerNote.length}/500</span>
          </label>

          <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 sm:p-5">
            <h3 className="text-sm font-semibold">Booking summary</h3>
            <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
              <SummaryItem label="Service" value={service.name} />
              <SummaryItem label="Date" value={appointmentDate ? formatDate(appointmentDate, availability?.timeZone ?? SALON_TIME_ZONE) : "Choose a date"} />
              <SummaryItem label="Time" value={selectedSlot?.label ?? "Choose an available time"} />
              <SummaryItem label="Price" value={formatBDTPrice(service.price)} />
              <SummaryItem label="Duration" value={formatServiceDuration(service.durationMinutes)} />
            </dl>
          </div>

          {error && <div role="alert" className="space-y-2 rounded-xl border border-red-900/70 bg-red-950/35 p-4 text-sm leading-6 text-red-200"><p>{error}</p>{error.toLowerCase().includes("session") && <Link href={signInHref} className="inline-flex min-h-9 items-center text-[var(--green-soft)] underline underline-offset-4">Sign in again to continue</Link>}</div>}

          <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={busy || availabilityLoading || Boolean(availabilityError) || !selectedSlot}>
            {busy ? "Sending request…" : <>Confirm Appointment<ArrowRight className="size-4" aria-hidden="true" /></>}
          </Button>
        </form>
      </>}
    </section>
  );
}

function BookingConfirmation({ appointment, timeZone }: { appointment: SalonAppointment; timeZone: string }) {
  const date = appointment.appointmentDate ? formatDate(appointment.appointmentDate, timeZone) : formatDateTime(appointment.startsAt, timeZone);
  const time = appointment.timeSlot ? availabilityLabel(appointment.timeSlot) : formatTime(appointment.startsAt, timeZone);
  return (
    <div role="status" className="rounded-2xl border border-[var(--primary)]/35 bg-[var(--card)] p-5 sm:p-7">
      <span className="grid size-12 place-items-center rounded-2xl bg-[var(--primary)]/15 text-[var(--green-light)]"><CheckCircle2 className="size-6" aria-hidden="true" /></span>
      <p className="mt-5 text-xs font-semibold uppercase tracking-[.18em] text-[var(--green-light)]">Request received</p>
      <h2 className="mt-2 text-2xl font-semibold">Appointment requested</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">The salon will review your request and confirm it. No payment has been taken.</p>
      <dl className="mt-5 grid gap-3 border-t border-[var(--border)] pt-5 sm:grid-cols-2">
        <SummaryItem label="Service" value={appointment.serviceSnapshot.name} />
        <SummaryItem label="Reference" value={appointment._id} mono />
        <SummaryItem label="Date" value={date} />
        <SummaryItem label="Time" value={time} />
        <SummaryItem label="Appointment status" value={appointment.status.toUpperCase()} />
        <SummaryItem label="Payment status" value={(appointment.paymentStatus ?? "unpaid").toUpperCase()} />
      </dl>
      <Button asChild className="mt-6 w-full sm:w-auto"><Link href="/appointments">View My Appointments<ArrowRight className="size-4" aria-hidden="true" /></Link></Button>
    </div>
  );
}

function SummaryItem({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return <div className="min-w-0"><dt className="text-xs text-[var(--muted)]">{label}</dt><dd className={`mt-1 break-words font-medium ${mono ? "font-mono text-xs" : ""}`}>{value}</dd></div>;
}

function reasonLabel(reason?: string) {
  if (reason === "booked") return "Booked";
  if (reason === "outside-business-hours") return "Service too long";
  return "Past / too soon";
}

function formatDate(value: string, timeZone: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "full", timeZone }).format(new Date(Date.UTC(year, month - 1, day, 12)));
}

function formatDateTime(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "full", timeStyle: "short", timeZone }).format(new Date(value));
}

function formatTime(value: string, timeZone: string) {
  return new Intl.DateTimeFormat("en-BD", { timeStyle: "short", timeZone }).format(new Date(value));
}

function availabilityLabel(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${String(displayHour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${suffix}`;
}
