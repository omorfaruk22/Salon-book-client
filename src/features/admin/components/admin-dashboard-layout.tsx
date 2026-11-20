"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft, CalendarDays, ChartNoAxesColumn, ChevronDown, ChevronLeft, ChevronRight,
  LayoutDashboard, LogOut, Menu, Scissors, Settings2, UserRound, Users, Wallet, X,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/providers/toast-provider";

const navigation = [
  { href: "/admin", label: "Overview", Icon: LayoutDashboard, exact: true },
  { href: "/admin/services", label: "Manage Services", Icon: Scissors },
  { href: "/admin/appointments", label: "Manage Appointments", Icon: CalendarDays },
  { href: "/admin/users", label: "Manage Users", Icon: Users },
  { href: "/admin/transactions", label: "Transactions", Icon: Wallet },
  { href: "/admin/profile", label: "My Profile", Icon: UserRound },
];

const pageCopy = [
  { match: (path: string) => path === "/admin", title: "Dashboard overview", description: "Your salon platform at a glance." },
  { match: (path: string) => path.startsWith("/admin/services"), title: "Manage services", description: "Maintain your salon menu and service availability." },
  { match: (path: string) => path.startsWith("/admin/appointments"), title: "Manage appointments", description: "Review requests and keep the salon schedule up to date." },
  { match: (path: string) => path.startsWith("/admin/users") || path.startsWith("/admin/customers"), title: "Manage users", description: "Review customer accounts and access." },
  { match: (path: string) => path.startsWith("/admin/transactions"), title: "Transactions", description: "Review successful customer payments." },
  { match: (path: string) => path.startsWith("/admin/profile"), title: "My profile", description: "Manage your administrator profile." },
];

export function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const { user, avatarUrl } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => setCollapsed(window.localStorage.getItem("salonbook-admin-sidebar") === "collapsed"), []);
  useEffect(() => { setMobileOpen(false); setProfileMenuOpen(false); }, [pathname]);

  const page = pageCopy.find((item) => item.match(pathname)) ?? pageCopy[0];
  const name = user?.name || "Administrator";
  const email = user?.email || "";
  const image = user?.imageUrl || avatarUrl || undefined;
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "A";

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

  function toggleCollapsed() {
    setCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem("salonbook-admin-sidebar", next ? "collapsed" : "expanded");
      return next;
    });
  }

  return <div className={`min-h-screen bg-[var(--background)] text-[var(--foreground)] lg:grid ${collapsed ? "lg:grid-cols-[5.25rem_minmax(0,1fr)]" : "lg:grid-cols-[17rem_minmax(0,1fr)]"}`}>
    <aside className={`sticky top-0 hidden h-screen flex-col border-r border-[var(--border)] bg-[var(--surface)] p-4 transition-[width] duration-200 lg:flex ${collapsed ? "items-center" : ""}`}>
      <Link href="/" className={`flex min-h-12 items-center gap-3 ${collapsed ? "justify-center" : "px-2"}`} aria-label="SalonBook home">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-[var(--green-light)]"><Scissors className="size-5" aria-hidden="true" /></span>
        {!collapsed && <span className="text-xl font-bold tracking-tight">Salon<span className="text-[var(--green-light)]">Book</span></span>}
      </Link>
      {!collapsed && <ProfileSummary image={image} initials={initials} name={name} email={email} />}
      <nav aria-label="Admin dashboard" className={`mt-8 w-full space-y-1 ${collapsed ? "" : ""}`}>
        {navigation.map((item) => <NavigationLink key={item.href} {...item} active={isActive(pathname, item.href, item.exact)} collapsed={collapsed} />)}
      </nav>
      <div className="mt-auto w-full space-y-1 border-t border-[var(--border)] pt-4">
        <Link href="/services" title={collapsed ? "Back to website" : undefined} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-[var(--muted)] transition hover:bg-[var(--card)] hover:text-white ${collapsed ? "justify-center px-0" : ""}`}><ArrowLeft className="size-4 shrink-0" aria-hidden="true" />{!collapsed && "Back to website"}</Link>
        <button type="button" onClick={() => void signOut()} disabled={signingOut} title={collapsed ? "Logout" : undefined} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-red-200 transition hover:bg-red-950/30 disabled:opacity-60 ${collapsed ? "justify-center px-0" : ""}`}><LogOut className="size-4 shrink-0" aria-hidden="true" />{!collapsed && (signingOut ? "Signing out…" : "Logout")}</button>
        <button type="button" onClick={toggleCollapsed} className={`hidden min-h-10 w-full items-center gap-3 rounded-xl px-3 text-sm text-[var(--muted)] transition hover:bg-[var(--card)] hover:text-white lg:flex ${collapsed ? "justify-center px-0" : ""}`} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : undefined}>
          {collapsed ? <ChevronRight className="size-4" aria-hidden="true" /> : <><ChevronLeft className="size-4" aria-hidden="true" />Collapse sidebar</>}
        </button>
      </div>
    </aside>

    <div className="min-w-0">
      <header className="sticky top-0 z-40 flex min-h-[4.5rem] items-center justify-between border-b border-[var(--border)] bg-[var(--background)]/95 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <button type="button" aria-label={mobileOpen ? "Close admin navigation" : "Open admin navigation"} aria-expanded={mobileOpen} aria-controls="admin-mobile-navigation" onClick={() => setMobileOpen((open) => !open)} className="grid size-10 shrink-0 place-items-center rounded-xl border border-[var(--border)] text-[var(--muted)] hover:text-white lg:hidden">{mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
          <div className="min-w-0"><p className="truncate text-sm font-semibold sm:text-base">{page.title}</p><p className="hidden truncate text-xs text-[var(--muted)] sm:block">{page.description}</p></div>
        </div>
        <div className="relative ml-3 flex shrink-0 items-center gap-2 sm:gap-3">
          <span className="hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--green-soft)] sm:inline-flex"><Settings2 className="size-3.5 text-[var(--green-light)]" aria-hidden="true" />Administrator</span>
          <button type="button" aria-label="Open admin profile menu" aria-expanded={profileMenuOpen} onClick={() => setProfileMenuOpen((open) => !open)} className="flex min-h-11 items-center gap-2 rounded-xl px-1.5 transition hover:bg-[var(--card)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)]">
            <Avatar image={image} initials={initials} size="size-9" /><span className="hidden max-w-32 truncate text-sm font-medium md:block">{name}</span><ChevronDown className="hidden size-4 text-[var(--muted)] md:block" aria-hidden="true" />
          </button>
          {profileMenuOpen && <div className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-2xl">
            <div className="flex items-center gap-3 rounded-xl bg-[var(--card)] p-3"><Avatar image={image} initials={initials} size="size-10" /><span className="min-w-0"><span className="block truncate text-sm font-semibold">{name}</span><span className="block truncate text-xs text-[var(--muted)]">{email}</span></span></div>
            <Link href="/admin/profile" onClick={() => setProfileMenuOpen(false)} className="mt-2 flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm text-[var(--muted)] hover:bg-[var(--card)] hover:text-white"><UserRound className="size-4" aria-hidden="true" />My profile</Link>
            <button type="button" onClick={() => void signOut()} className="flex min-h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm text-red-200 hover:bg-red-950/30"><LogOut className="size-4" aria-hidden="true" />Logout</button>
          </div>}
        </div>
      </header>

      {mobileOpen && <><button type="button" aria-label="Close admin navigation" onClick={() => setMobileOpen(false)} className="fixed inset-0 z-40 bg-black/60 lg:hidden" /><aside id="admin-mobile-navigation" className="fixed inset-y-0 left-0 z-50 flex w-[min(19rem,88vw)] flex-col border-r border-[var(--border)] bg-[var(--surface)] p-4 shadow-2xl lg:hidden">
        <div className="flex items-center justify-between"><Link href="/" className="flex items-center gap-2 text-lg font-bold">Salon<span className="text-[var(--green-light)]">Book</span></Link><button type="button" onClick={() => setMobileOpen(false)} aria-label="Close admin navigation" className="grid size-10 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--card)]"><X className="size-5" /></button></div>
        <ProfileSummary image={image} initials={initials} name={name} email={email} />
        <nav aria-label="Admin mobile navigation" className="mt-6 space-y-1">{navigation.map((item) => <NavigationLink key={item.href} {...item} active={isActive(pathname, item.href, item.exact)} onClick={() => setMobileOpen(false)} />)}</nav>
        <div className="mt-auto space-y-1 border-t border-[var(--border)] pt-4"><Link href="/services" onClick={() => setMobileOpen(false)} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-[var(--muted)] hover:bg-[var(--card)]"><ArrowLeft className="size-4" />Back to website</Link><button type="button" onClick={() => void signOut()} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-red-200 hover:bg-red-950/30"><LogOut className="size-4" />Logout</button></div>
      </aside></>}

      <div className="min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">{children}</div>
    </div>
  </div>;
}

function ProfileSummary({ image, initials, name, email }: { image?: string; initials: string; name: string; email: string }) {
  return <div className="mt-7 flex min-w-0 items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-3"><Avatar image={image} initials={initials} size="size-11" /><span className="min-w-0"><span className="block truncate text-sm font-semibold">{name}</span><span className="mt-0.5 block truncate text-xs text-[var(--muted)]">{email}</span><span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--green-light)]"><ChartNoAxesColumn className="size-3" aria-hidden="true" />Admin account</span></span></div>;
}

function Avatar({ image, initials, size }: { image?: string; initials: string; size: string }) {
  return <span className={`grid ${size} shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--primary)]/15 text-sm font-bold text-[var(--green-light)]`}>{image ? <Image src={image} alt="" width={48} height={48} unoptimized className="size-full object-cover" /> : initials}</span>;
}

function NavigationLink({ href, label, Icon, active, collapsed = false, onClick }: { href: string; label: string; Icon: typeof LayoutDashboard; active: boolean; collapsed?: boolean; exact?: boolean; onClick?: () => void }) {
  return <Link href={href} onClick={onClick} aria-current={active ? "page" : undefined} title={collapsed ? label : undefined} className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)] ${collapsed ? "justify-center px-0" : ""} ${active ? "bg-[var(--primary)]/15 font-semibold text-[var(--green-light)]" : "text-[var(--muted)] hover:bg-[var(--card)] hover:text-white"}`}><Icon className="size-4 shrink-0" aria-hidden="true" />{!collapsed && label}</Link>;
}

function isActive(pathname: string, href: string, exact = false) {
  if (href === "/admin/users" && pathname.startsWith("/admin/customers")) return true;
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}
