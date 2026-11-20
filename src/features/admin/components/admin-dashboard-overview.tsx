"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
  Activity, ArrowRight, ArrowUpRight, CalendarCheck2, CalendarClock, CalendarDays,
  CircleDollarSign, CreditCard, Plus, RefreshCw, Scissors, Users,
} from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/components/providers/auth-provider";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBDTPrice, formatSalonAppointmentTime } from "@/lib/service-format";
import type { ApiEnvelope } from "@/types/service";
import type { AdminAppointmentAnalytics, AdminDashboardStats, AdminRecentAppointment, AdminRecentTransaction } from "@/types/admin-dashboard";

type DashboardData = {
  stats: AdminDashboardStats;
  appointments: AdminRecentAppointment[];
  transactions: AdminRecentTransaction[];
  analytics: AdminAppointmentAnalytics;
};

const number = new Intl.NumberFormat("en-BD");
const money = new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 });

export function AdminDashboardOverview() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    else setLoading(true);
    try {
      const responses = await Promise.all([
        apiFetch("/admin/dashboard/stats", { cache: "no-store" }),
        apiFetch("/admin/dashboard/recent-appointments?limit=6", { cache: "no-store" }),
        apiFetch("/admin/dashboard/recent-transactions?limit=6", { cache: "no-store" }),
        apiFetch("/admin/dashboard/appointment-analytics?days=30", { cache: "no-store" }),
      ]);
      const results = await Promise.all(responses.map((response) => response.json().catch(() => null)));
      const [statsResult, appointmentsResult, transactionsResult, analyticsResult] = results as [
        ApiEnvelope<AdminDashboardStats> | null,
        ApiEnvelope<AdminRecentAppointment[]> | null,
        ApiEnvelope<AdminRecentTransaction[]> | null,
        ApiEnvelope<AdminAppointmentAnalytics> | null,
      ];
      const failedIndex = responses.findIndex((response, index) => !response.ok || !results[index]?.data);
      if (failedIndex !== -1) {
        const result = results[failedIndex] as ApiEnvelope<unknown> | null;
        throw new Error(result?.error?.message ?? "Could not load the admin dashboard. Please retry.");
      }
      setData({
        stats: statsResult!.data,
        appointments: appointmentsResult!.data,
        transactions: transactionsResult!.data,
        analytics: analyticsResult!.data,
      });
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load the admin dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (loading) return <DashboardSkeleton />;
  if (error || !data) return <div><ErrorState title="Admin dashboard unavailable" description={error || "We could not load platform data."} onRetry={() => void load()} />{error.toLowerCase().includes("session") && <Link href={`/sign-in?next=${encodeURIComponent("/admin")}`} className="mt-3 inline-flex min-h-10 items-center text-sm text-[var(--green-light)] underline">Sign in again</Link>}</div>;

  const firstName = user?.name.trim().split(/\s+/)[0] || "Admin";
  const metrics = [
    { label: "Registered customers", value: number.format(data.stats.totalCustomers), detail: "Customer accounts · includes blocked", Icon: Users, tone: "text-sky-300", glow: "bg-sky-400/10" },
    { label: "Active services", value: number.format(data.stats.activeServices), detail: "Available in the salon menu", Icon: Scissors, tone: "text-[var(--green-light)]", glow: "bg-green-400/10" },
    { label: "Appointment requests", value: number.format(data.stats.totalAppointments), detail: "All appointment records", Icon: CalendarDays, tone: "text-violet-300", glow: "bg-violet-400/10" },
    { label: "Pending appointments", value: number.format(data.stats.pendingAppointments), detail: "Awaiting salon review", Icon: CalendarClock, tone: "text-amber-300", glow: "bg-amber-400/10" },
    { label: "Confirmed appointments", value: number.format(data.stats.confirmedAppointments), detail: "Accepted by the salon", Icon: CalendarCheck2, tone: "text-emerald-300", glow: "bg-emerald-400/10" },
    { label: "Successful payments", value: number.format(data.stats.successfulPayments), detail: "Verified paid transactions", Icon: CreditCard, tone: "text-[var(--green-light)]", glow: "bg-green-400/10" },
    ...(data.stats.totalRevenue !== undefined ? [{ label: "Paid revenue", value: money.format(data.stats.totalRevenue), detail: "From successful transactions", Icon: CircleDollarSign, tone: "text-[var(--green-soft)]", glow: "bg-green-400/10" }] : []),
  ];

  return <div className="mx-auto max-w-[1500px] space-y-8">
    <section className="relative overflow-hidden rounded-3xl border border-[var(--border)] bg-[radial-gradient(circle_at_90%_10%,rgb(34_197_94_/_18%),transparent_34%),linear-gradient(125deg,#111714,#151d18)] p-6 sm:p-8 lg:p-9">
      <div className="pointer-events-none absolute -right-12 -top-16 size-64 rounded-full border border-[var(--green-light)]/10" /><div className="pointer-events-none absolute -right-2 -top-6 size-44 rounded-full border border-[var(--green-light)]/10" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.2em] text-[var(--green-light)]"><Activity className="size-4" aria-hidden="true" />SalonBook administration</p><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Welcome back, {firstName}!</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">Here&apos;s what&apos;s happening with your salon booking platform today.</p></div><button type="button" onClick={() => void load(true)} disabled={refreshing} className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-[var(--border)] bg-[var(--background)]/40 px-4 text-sm font-semibold transition hover:border-[var(--green-light)]/60 disabled:opacity-60 sm:self-auto"><RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} aria-hidden="true" />{refreshing ? "Refreshing…" : "Refresh data"}</button></div>
    </section>

    <section aria-labelledby="admin-stats-title"><div className="mb-4"><p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--green-light)]">Live platform data</p><h2 id="admin-stats-title" className="mt-1 text-xl font-semibold">Platform overview</h2></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{metrics.map(({ label, value, detail, Icon, tone, glow }) => <article key={label} className="group rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[var(--green-light)]/30"><div className="flex items-start justify-between gap-4"><div><p className="text-sm text-[var(--muted)]">{label}</p><p className={`mt-4 text-3xl font-semibold tracking-tight ${tone}`}>{value}</p></div><span className={`grid size-11 place-items-center rounded-xl ${glow} ${tone}`}><Icon className="size-5" aria-hidden="true" /></span></div><p className="mt-3 text-xs text-[var(--muted)]">{detail}</p></article>)}</div></section>

    <section aria-label="Appointment analytics" className="grid gap-5 xl:grid-cols-[.8fr_1.2fr]">
      <StatusDistribution distribution={data.analytics.statusDistribution} />
      <AppointmentTrend trend={data.analytics.dailyTrend} days={data.analytics.days} />
    </section>

    <RecentAppointments appointments={data.appointments} />
    <RecentTransactions transactions={data.transactions} />

    <section aria-labelledby="quick-actions-heading"><div className="mb-4"><p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--green-light)]">Shortcuts</p><h2 id="quick-actions-heading" className="mt-1 text-xl font-semibold">Quick actions</h2></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">{
      [
        { href: "/admin/services", label: "Add new service", detail: "Create a menu offering", Icon: Plus },
        { href: "/admin/services", label: "Manage services", detail: "Update salon menu", Icon: Scissors },
        { href: "/admin/appointments", label: "Manage appointments", detail: "Review booking requests", Icon: CalendarDays },
        { href: "/admin/users", label: "Manage users", detail: "Review customer access", Icon: Users },
        { href: "/admin/transactions", label: "View transactions", detail: "Review paid records", Icon: CreditCard },
      ].map(({ href, label, detail, Icon }) => <Link key={label} href={href} className="group flex min-h-28 flex-col justify-between rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 transition hover:border-[var(--green-light)]/50 hover:bg-[var(--surface)]"><span className="flex items-center justify-between"><Icon className="size-5 text-[var(--green-light)]" aria-hidden="true" /><ArrowUpRight className="size-4 text-[var(--muted)] transition group-hover:text-white" aria-hidden="true" /></span><span><span className="block text-sm font-semibold">{label}</span><span className="mt-1 block text-xs text-[var(--muted)]">{detail}</span></span></Link>)}
    </div></section>
  </div>;
}

function StatusDistribution({ distribution }: { distribution: AdminAppointmentAnalytics["statusDistribution"] }) {
  const entries = [
    { key: "pending", label: "Pending", count: distribution.pending, color: "bg-amber-400", text: "text-amber-300" },
    { key: "confirmed", label: "Confirmed", count: distribution.confirmed, color: "bg-emerald-400", text: "text-emerald-300" },
    { key: "cancelled", label: "Cancelled", count: distribution.cancelled, color: "bg-rose-400", text: "text-rose-300" },
    { key: "completed", label: "Completed", count: distribution.completed, color: "bg-sky-400", text: "text-sky-300" },
  ];
  const total = entries.reduce((sum, entry) => sum + entry.count, 0);
  return <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6"><SectionTitle eyebrow="All-time" title="Appointment status" note="Distribution of every recorded request" />
    {total === 0 ? <EmptyChart message="No appointment data is available yet." /> : <><div className="mt-7 flex h-3 overflow-hidden rounded-full bg-[var(--surface)]" aria-label={`${total} appointments across all statuses`}>{entries.map((entry) => entry.count > 0 && <span key={entry.key} className={`${entry.color} transition-all`} style={{ width: `${entry.count / total * 100}%` }} />)}</div><div className="mt-6 grid gap-3 sm:grid-cols-2">{entries.map((entry) => <div key={entry.key} className="flex items-center justify-between rounded-xl border border-[var(--border)]/70 bg-[var(--surface)] px-3 py-3"><span className="flex items-center gap-2 text-sm text-[var(--muted)]"><span className={`size-2.5 rounded-full ${entry.color}`} />{entry.label}</span><span className={`font-semibold ${entry.text}`}>{number.format(entry.count)}</span></div>)}</div><p className="mt-5 text-xs text-[var(--muted)]">{number.format(total)} total appointment records</p></>}
  </article>;
}

function AppointmentTrend({ trend, days }: { trend: AdminAppointmentAnalytics["dailyTrend"]; days: number }) {
  const recent = trend.slice(-14);
  const max = Math.max(...recent.map((entry) => entry.total), 1);
  return <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-6"><SectionTitle eyebrow={`${days} days · Asia/Dhaka`} title="Appointment requests" note="Requests by booking date" />
    {!recent.length ? <EmptyChart message={`No appointment requests in the last ${days} days.`} /> : <div className="mt-7"><div className="flex h-48 items-end gap-2 border-b border-l border-[var(--border)] px-2 pb-1 sm:gap-3">{recent.map((entry) => <div key={entry.date} className="group relative flex h-full min-w-0 flex-1 items-end justify-center"><span className="pointer-events-none absolute -top-8 z-10 hidden whitespace-nowrap rounded-lg border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs text-white shadow-xl group-hover:block">{number.format(entry.total)} requests · {formatDay(entry.date)}</span><span className="w-full max-w-10 rounded-t-md bg-gradient-to-t from-[var(--primary)] to-[var(--green-light)] transition group-hover:brightness-125" style={{ height: `${Math.max(8, entry.total / max * 100)}%` }} /><span className="absolute -bottom-6 text-[9px] text-[var(--muted)] sm:text-[10px]">{recent.length <= 7 || recent.indexOf(entry) % 2 === 0 || recent.indexOf(entry) === recent.length - 1 ? shortDay(entry.date) : ""}</span></div>)}</div><div className="mt-10 flex flex-wrap items-center gap-4 text-xs text-[var(--muted)]"><span className="inline-flex items-center gap-2"><span className="size-2 rounded-sm bg-[var(--green-light)]" />Appointment requests</span><span>Showing {number.format(recent.length)} active dates from the latest {days} days</span></div></div>}
  </article>;
}

function RecentAppointments({ appointments }: { appointments: AdminRecentAppointment[] }) {
  return <section aria-labelledby="recent-admin-appointments-heading"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--green-light)]">Latest requests</p><h2 id="recent-admin-appointments-heading" className="mt-1 text-xl font-semibold">Recent appointments</h2></div><Link href="/admin/appointments" className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[var(--green-light)] hover:underline">Manage appointments<ArrowRight className="size-4" aria-hidden="true" /></Link></div>
    {!appointments.length ? <EmptyPanel icon={<CalendarDays className="size-5" />} title="No appointments yet" detail="New appointment requests will appear here." /> : <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)]"><table className="w-full min-w-[940px] text-left text-sm"><thead className="bg-[var(--surface)] text-xs uppercase tracking-wider text-[var(--muted)]"><tr><th className="px-4 py-4 font-medium">Reference</th><th className="px-4 py-4 font-medium">Customer</th><th className="px-4 py-4 font-medium">Service</th><th className="px-4 py-4 font-medium">Appointment</th><th className="px-4 py-4 font-medium">Price</th><th className="px-4 py-4 font-medium">Status</th><th className="px-4 py-4 font-medium">Payment</th></tr></thead><tbody>{appointments.map((appointment) => <tr key={appointment._id} className="border-t border-[var(--border)]/80"><td className="px-4 py-4 font-mono text-xs text-[var(--muted)]">{appointment._id.slice(-8).toUpperCase()}</td><td className="px-4 py-4"><p className="font-medium">{appointment.customer.name}</p><p className="mt-1 text-xs text-[var(--muted)]">{appointment.customer.email || "Email unavailable"}</p></td><td className="px-4 py-4 font-medium">{appointment.serviceName}</td><td className="px-4 py-4 text-[var(--muted)]">{formatSalonAppointmentTime(appointment.appointmentDate, appointment.timeSlot, appointment.startsAt)}<span className="mt-1 block text-[10px]">Requested {formatDate(appointment.createdAt)}</span></td><td className="px-4 py-4 whitespace-nowrap">{formatBDTPrice(appointment.servicePrice)}</td><td className="px-4 py-4"><StatusBadge status={appointment.status} /></td><td className="px-4 py-4"><PaymentBadge status={appointment.paymentStatus} /></td></tr>)}</tbody></table></div>}
  </section>;
}

function RecentTransactions({ transactions }: { transactions: AdminRecentTransaction[] }) {
  return <section aria-labelledby="recent-admin-transactions-heading"><div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.16em] text-[var(--green-light)]">Verified payments</p><h2 id="recent-admin-transactions-heading" className="mt-1 text-xl font-semibold">Recent successful transactions</h2></div><Link href="/admin/transactions" className="inline-flex min-h-10 items-center gap-2 text-sm font-medium text-[var(--green-light)] hover:underline">View transactions<ArrowRight className="size-4" aria-hidden="true" /></Link></div>
    {!transactions.length ? <EmptyPanel icon={<CreditCard className="size-5" />} title="No successful transactions yet" detail="Transactions appear after Stripe confirms a payment." /> : <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--card)]"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-[var(--surface)] text-xs uppercase tracking-wider text-[var(--muted)]"><tr><th className="px-4 py-4 font-medium">Reference</th><th className="px-4 py-4 font-medium">Customer</th><th className="px-4 py-4 font-medium">Service / appointment</th><th className="px-4 py-4 font-medium">Amount</th><th className="px-4 py-4 font-medium">Status</th><th className="px-4 py-4 font-medium">Paid date</th></tr></thead><tbody>{transactions.map((transaction) => <tr key={transaction._id} className="border-t border-[var(--border)]/80"><td className="px-4 py-4 font-mono text-xs text-[var(--muted)]">{transaction._id.slice(-8).toUpperCase()}</td><td className="px-4 py-4"><p className="font-medium">{transaction.customer.name}</p><p className="mt-1 text-xs text-[var(--muted)]">{transaction.customer.email || "Email unavailable"}</p></td><td className="px-4 py-4"><p className="font-medium">{transaction.serviceName}</p><p className="mt-1 font-mono text-[10px] text-[var(--muted)]">Appointment {transaction.appointmentId.slice(-8).toUpperCase()}</p></td><td className="px-4 py-4 whitespace-nowrap font-semibold">{money.format(transaction.amount)}</td><td className="px-4 py-4"><PaymentBadge status="paid" /></td><td className="px-4 py-4 text-[var(--muted)]">{formatDate(transaction.paidAt ?? transaction.createdAt)}</td></tr>)}</tbody></table></div>}
  </section>;
}

function SectionTitle({ eyebrow, title, note }: { eyebrow: string; title: string; note: string }) {
  return <div><p className="text-[10px] font-semibold uppercase tracking-[.17em] text-[var(--green-light)]">{eyebrow}</p><h2 className="mt-1 text-lg font-semibold">{title}</h2><p className="mt-1 text-xs text-[var(--muted)]">{note}</p></div>;
}

function EmptyChart({ message }: { message: string }) {
  return <div className="mt-5 grid min-h-44 place-items-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-5 text-center"><div><Activity className="mx-auto size-6 text-[var(--muted)]" aria-hidden="true" /><p className="mt-3 text-sm text-[var(--muted)]">{message}</p></div></div>;
}

function EmptyPanel({ icon, title, detail }: { icon: React.ReactNode; title: string; detail: string }) {
  return <div className="grid min-h-36 place-items-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-6 text-center"><div><span className="mx-auto grid size-10 place-items-center rounded-xl bg-[var(--surface)] text-[var(--muted)]">{icon}</span><p className="mt-3 font-semibold">{title}</p><p className="mt-1 text-sm text-[var(--muted)]">{detail}</p></div></div>;
}

function StatusBadge({ status }: { status: AdminRecentAppointment["status"] }) {
  const style = status === "confirmed" || status === "completed" ? "bg-emerald-400/10 text-emerald-300" : status === "pending" ? "bg-amber-400/10 text-amber-300" : "bg-rose-400/10 text-rose-300";
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${style}`}>{status}</span>;
}

function PaymentBadge({ status }: { status: AdminRecentAppointment["paymentStatus"] | "paid" }) {
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${status === "paid" ? "bg-emerald-400/10 text-emerald-300" : "bg-[var(--surface)] text-[var(--muted)]"}`}><span className={`size-1.5 rounded-full ${status === "paid" ? "bg-emerald-400" : "bg-slate-500"}`} />{status}</span>;
}

function DashboardSkeleton() {
  return <div className="mx-auto max-w-[1500px] space-y-8"><Skeleton className="h-48 rounded-3xl" /><section><Skeleton className="mb-4 h-7 w-56" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{Array.from({ length: 7 }, (_, index) => <Skeleton key={index} className="h-36 rounded-2xl" />)}</div></section><div className="grid gap-5 xl:grid-cols-2"><Skeleton className="h-80 rounded-2xl" /><Skeleton className="h-80 rounded-2xl" /></div><Skeleton className="h-72 rounded-2xl" /><Skeleton className="h-64 rounded-2xl" /></div>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka" }).format(new Date(value));
}

function formatDay(value: string) {
  return new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeZone: "Asia/Dhaka" }).format(new Date(`${value}T12:00:00+06:00`));
}

function shortDay(value: string) {
  return new Intl.DateTimeFormat("en-BD", { day: "numeric", month: "short", timeZone: "Asia/Dhaka" }).format(new Date(`${value}T12:00:00+06:00`));
}
