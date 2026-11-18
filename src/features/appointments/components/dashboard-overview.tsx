"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, CalendarDays, CircleDollarSign, Scissors, Users } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import type { ApiEnvelope } from "@/types/service";

type Summary = {
  appointments: Record<string, number>;
  transactions: Record<string, { count: number; revenue: number }>;
  customers?: number;
  services?: { total: number; active: number };
};

export function DashboardOverview({ admin = false }: { admin?: boolean }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    try {
      const response = await apiFetch("/dashboard/summary");
      const result = (await response.json()) as ApiEnvelope<Summary>;
      if (!response.ok) throw new Error(result.error?.message ?? "Could not load dashboard.");
      setSummary(result.data); setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load dashboard."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const paid = summary?.transactions.paid?.revenue ?? 0;
  const money = new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 });

  if (loading) return <p className="py-12 text-center text-[var(--muted)]">Loading dashboard…</p>;
  if (error) return <p role="alert" className="mt-6 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">{error}</p>;
  if (!summary) return null;

  if (admin) return <div className="mt-8">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Metric icon={<Users />} label="Customers" value={summary.customers ?? 0} hint="Registered customer accounts" />
      <Metric icon={<Scissors />} label="Active services" value={`${summary.services?.active ?? 0} / ${summary.services?.total ?? 0}`} hint="Available in the public menu" />
      <Metric icon={<CalendarDays />} label="Pending requests" value={summary.appointments.pending ?? 0} hint="Appointments awaiting review" />
      <Metric icon={<CircleDollarSign />} label="Paid revenue" value={money.format(paid)} hint="Confirmed Stripe payments" />
    </div>
    <div className="mt-8 grid gap-4 md:grid-cols-3"><QuickLink href="/admin/appointments" title="Review appointments" detail={`${summary.appointments.confirmed ?? 0} confirmed · ${summary.appointments.cancelled ?? 0} cancelled`} /><QuickLink href="/admin/services" title="Manage services" detail="Edit the salon menu and pricing" /><QuickLink href="/admin/transactions" title="View transactions" detail={`${summary.transactions.paid?.count ?? 0} completed payments`} /></div>
  </div>;

  const upcoming = (summary.appointments.pending ?? 0) + (summary.appointments.confirmed ?? 0);
  return <div className="mt-8">
    <div className="grid gap-4 sm:grid-cols-3"><Metric icon={<CalendarDays />} label="Upcoming requests" value={upcoming} hint={`${summary.appointments.pending ?? 0} awaiting confirmation`} /><Metric icon={<CircleDollarSign />} label="Paid transactions" value={summary.transactions.paid?.count ?? 0} hint={`${money.format(paid)} total paid`} /><Metric icon={<Scissors />} label="Completed visits" value={summary.appointments.completed ?? 0} hint="Your appointment history" /></div>
    <div className="mt-8 grid gap-4 md:grid-cols-2"><QuickLink href="/appointments" title="Manage appointments" detail="View updates and cancel pending requests" /><QuickLink href="/services" title="Explore services" detail="Find your next salon treatment" /></div>
  </div>;
}

function Metric({ icon, label, value, hint }: { icon: React.ReactNode; label: string; value: string | number; hint: string }) {
  return <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5"><div className="flex items-center justify-between"><span className="text-sm text-[var(--muted)]">{label}</span><span className="text-[var(--green-light)]">{icon}</span></div><p className="mt-5 text-3xl font-semibold">{value}</p><p className="mt-1 text-xs text-[var(--muted)]">{hint}</p></article>;
}

function QuickLink({ href, title, detail }: { href: string; title: string; detail: string }) {
  return <Link href={href} className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition hover:border-[var(--primary)]/70"><div className="flex justify-between"><h2 className="font-semibold">{title}</h2><ArrowUpRight size={18} className="text-[var(--muted)] transition group-hover:text-[var(--green-light)]" /></div><p className="mt-2 text-sm text-[var(--muted)]">{detail}</p></Link>;
}
