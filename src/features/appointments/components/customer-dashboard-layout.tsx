"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, CalendarDays, Home, LogOut, Menu, Scissors, UserRound, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/providers/toast-provider";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/my-appointments", label: "My Appointments", icon: CalendarDays },
  { href: "/dashboard/profile", label: "My Profile", icon: UserRound },
];

const backToServicesClass = "flex min-h-12 w-full items-center gap-3 rounded-xl border border-[var(--green-light)]/25 bg-[var(--primary)]/10 px-3 text-sm font-semibold text-[var(--green-light)] transition-colors hover:border-[var(--green-light)]/50 hover:bg-[var(--primary)]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)]";

export function CustomerDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const { user, avatarUrl } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("Could not sign out. Please try again.");
      router.replace("/");
      router.refresh();
    } catch (error) {
      toast(error instanceof Error ? error.message : "Could not sign out. Please try again.", "error");
    } finally { setSigningOut(false); }
  }

  const profileImage = user?.imageUrl ?? avatarUrl ?? undefined;
  const initials = user?.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "U";

  return <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] md:grid md:grid-cols-[17rem_minmax(0,1fr)]">
    <aside className="sticky top-0 hidden h-screen flex-col border-r border-[var(--border)] bg-[var(--surface)] p-5 md:flex">
      <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight" aria-label="SalonBook home"><span className="grid size-10 place-items-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--green-light)]"><Scissors className="size-5" aria-hidden="true" /></span><span>Salon<span className="text-[var(--green-light)]">Book</span></span></Link>
      <ProfileSummary image={profileImage} initials={initials} name={user?.name ?? "Customer"} email={user?.email ?? ""} />
      <nav aria-label="Customer dashboard" className="mt-8 space-y-1">
        {navigation.map((item) => <DashboardNavLink key={item.href} href={item.href} label={item.label} Icon={item.icon} active={isActive(pathname, item.href)} />)}
      </nav>
      <div className="mt-auto space-y-1 border-t border-[var(--border)] pt-4">
        <Link href="/services" className={backToServicesClass}><ArrowLeft className="size-4 shrink-0" aria-hidden="true" />Back to Services</Link>
        <SignOutButton onClick={() => void signOut()} disabled={signingOut} />
      </div>
    </aside>

    <div className="min-w-0">
      <header className="sticky top-0 z-40 flex min-h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/95 px-4 backdrop-blur-xl md:hidden">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">Salon<span className="text-[var(--green-light)]">Book</span></Link>
        <button type="button" aria-label={mobileOpen ? "Close dashboard menu" : "Open dashboard menu"} aria-expanded={mobileOpen} aria-controls="customer-dashboard-mobile-nav" onClick={() => setMobileOpen((open) => !open)} className="grid size-11 place-items-center rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)]">{mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
      </header>
      {mobileOpen && <div id="customer-dashboard-mobile-nav" className="fixed inset-x-0 top-16 z-40 border-b border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl md:hidden">
        <ProfileSummary image={profileImage} initials={initials} name={user?.name ?? "Customer"} email={user?.email ?? ""} compact />
        <nav aria-label="Customer dashboard mobile" className="mt-4 space-y-1">{navigation.map((item) => <DashboardNavLink key={item.href} href={item.href} label={item.label} Icon={item.icon} active={isActive(pathname, item.href)} onClick={() => setMobileOpen(false)} />)}</nav>
        <div className="mt-3 border-t border-[var(--border)] pt-3"><Link href="/services" onClick={() => setMobileOpen(false)} className={backToServicesClass}><ArrowLeft className="size-4 shrink-0" aria-hidden="true" />Back to Services</Link><SignOutButton onClick={() => void signOut()} disabled={signingOut} /></div>
      </div>}
      <main className="min-h-[calc(100vh-4rem)] px-4 py-7 sm:px-6 sm:py-10 lg:px-10">{children}</main>
    </div>
  </div>;
}

function ProfileSummary({ image, initials, name, email, compact = false }: { image?: string; initials: string; name: string; email: string; compact?: boolean }) {
  return <div className={`flex min-w-0 items-center gap-3 ${compact ? "rounded-2xl bg-[var(--card)] p-3" : "mt-8 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3"}`}>
    <span className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--primary)]/15 text-sm font-bold text-[var(--green-light)]">{image ? <Image src={image} alt="" width={44} height={44} unoptimized className="size-full object-cover" /> : initials}</span>
    <span className="min-w-0"><span className="block truncate text-sm font-semibold">{name}</span><span className="mt-0.5 block truncate text-xs text-[var(--muted)]">{email}</span></span>
  </div>;
}

function DashboardNavLink({ href, label, Icon, active, onClick }: { href: string; label: string; Icon: typeof Home; active: boolean; onClick?: () => void }) {
  return <Link href={href} onClick={onClick} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)] ${active ? "bg-[var(--primary)]/15 font-semibold text-[var(--green-light)]" : "text-[var(--muted)] hover:bg-[var(--card)] hover:text-white"}`}><Icon className="size-4" aria-hidden="true" />{label}</Link>;
}

function SignOutButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return <button type="button" onClick={onClick} disabled={disabled} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-red-200 transition hover:bg-red-950/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300 disabled:opacity-60"><LogOut className="size-4" aria-hidden="true" />{disabled ? "Signing out…" : "Logout"}</button>;
}

function isActive(pathname: string, href: string) {
  return href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}
