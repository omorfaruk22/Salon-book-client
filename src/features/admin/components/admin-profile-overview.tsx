"use client";

import Image from "next/image";
import { ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { SectionHeading } from "@/components/ui/section-heading";
import { GoogleAccountLink } from "@/features/auth/components/google-account-link";

export function AdminProfileOverview() {
  const { user, avatarUrl, isLoading } = useAuth();
  const image = user?.imageUrl ?? avatarUrl;

  if (isLoading) return <main className="mx-auto max-w-4xl animate-pulse py-2"><div className="h-8 w-48 rounded-lg bg-[var(--card)]" /><div className="mt-2 h-5 w-80 max-w-full rounded-lg bg-[var(--card)]" /><div className="mt-8 h-64 rounded-3xl bg-[var(--card)]" /></main>;

  return <main className="mx-auto max-w-4xl py-2"><SectionHeading eyebrow="Administrator" title="My profile" description="Your authenticated SalonBook administrator account." />
    <section className="mt-8 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-8">
      <div className="flex flex-col gap-5 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-center"><span className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--primary)]/15 text-2xl font-bold text-[var(--green-light)]">{image ? <Image src={image} alt="Administrator profile" width={80} height={80} unoptimized className="size-full object-cover" /> : <UserRound className="size-8" aria-hidden="true" />}</span><div className="min-w-0"><h2 className="text-xl font-semibold">{user?.name || "Administrator"}</h2><p className="mt-1 break-all text-sm text-[var(--muted)]">{user?.email}</p><span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--primary)]/15 px-3 py-1 text-xs font-semibold capitalize text-[var(--green-light)]"><ShieldCheck className="size-3.5" aria-hidden="true" />{user?.role}</span></div></div>
      <dl className="grid gap-x-8 gap-y-5 pt-6 sm:grid-cols-2"><ProfileValue label="Full name" value={user?.name || "—"} /><ProfileValue label="Email address" value={user?.email || "—"} /><ProfileValue label="Account role" value={user?.role || "Administrator"} capitalize /><ProfileValue label="Account status" value={user?.status || "active"} capitalize /></dl>
      <p className="mt-7 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-xs leading-5 text-[var(--muted)]">Profile data is read from the authenticated account. Admin profile editing is not part of this dashboard phase.</p>
    </section>
    {user?.email && <GoogleAccountLink email={user.email} />}
  </main>;
}

function ProfileValue({ label, value, capitalize = false }: { label: string; value: string; capitalize?: boolean }) {
  return <div><dt className="text-xs font-medium uppercase tracking-wider text-[var(--muted)]">{label}</dt><dd className={`mt-2 break-words text-sm font-medium text-[var(--foreground)] ${capitalize ? "capitalize" : ""}`}>{value}</dd></div>;
}
