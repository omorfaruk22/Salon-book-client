"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, CircleUserRound, LayoutDashboard, Menu, Scissors, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/components/providers/auth-provider";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, avatarUrl, isLoading: authLoading } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const accountButtonRef = useRef<HTMLButtonElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    const updateScrollState = () => setScrolled(window.scrollY > 8);
    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });
    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  useEffect(() => {
    if (!accountOpen) return;
    const firstFrame = window.requestAnimationFrame(() => {
      accountMenuRef.current?.querySelector<HTMLElement>("[role='menuitem']")?.focus();
    });
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setAccountOpen(false);
      accountButtonRef.current?.focus();
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      window.cancelAnimationFrame(firstFrame);
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!mobileMenuRef.current?.contains(target) && !mobileButtonRef.current?.contains(target)) setMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setMenuOpen(false);
      mobileButtonRef.current?.focus();
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  function handleAccountMenuKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const items = Array.from(accountMenuRef.current?.querySelectorAll<HTMLElement>("[role='menuitem']") ?? []);
    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const direction = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (currentIndex + direction + items.length) % items.length;
      items[nextIndex]?.focus();
    } else if (event.key === "Home") {
      event.preventDefault();
      items[0]?.focus();
    } else if (event.key === "End") {
      event.preventDefault();
      items.at(-1)?.focus();
    }
  }

  async function signOut() {
    setSigningOut(true);
    setSignOutError("");
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("We could not end your session. Please try again.");
      setMenuOpen(false);
      setAccountOpen(false);
      router.replace("/");
      router.refresh();
    } catch {
      setSignOutError("We could not end your session. Please try again.");
    } finally {
      setSigningOut(false);
    }
  }

  const dashboardHref = user?.role === "admin" ? "/admin" : "/dashboard";
  const dashboardLabel = user?.role === "admin" ? "Admin dashboard" : "Customer dashboard";
  const dashboardActive = pathname === dashboardHref || pathname.startsWith(`${dashboardHref}/`);

  return <header className={`sticky top-0 z-50 border-b bg-[var(--background)]/95 backdrop-blur-xl transition-[border-color,background-color] duration-200 motion-reduce:transition-none ${scrolled ? "border-[var(--green-light)]/20" : "border-[var(--border)]"}`}>
    <div className="mx-auto flex min-h-[4.25rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <Link href="/" className="group flex shrink-0 items-center gap-2 text-xl font-bold tracking-tight focus-visible:rounded-lg" aria-label="SalonBook home">
        <span className="grid size-9 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--green-light)] transition-colors group-hover:border-[var(--green-light)]/50"><Scissors className="size-[18px]" aria-hidden="true" /></span>
        <span>Salon<span className="text-[var(--green-light)]">Book</span></span>
      </Link>

      <nav aria-label="Main navigation" className="hidden min-w-0 items-center gap-1 lg:flex">
        <NavLink href="/" active={pathname === "/"}>Home</NavLink>
        <NavLink href="/services" active={pathname.startsWith("/services")}>Services</NavLink>
        <NavLink href="/about" active={pathname === "/about"}>About</NavLink>
        <NavLink href="/contact" active={pathname === "/contact"}>Contact</NavLink>
      </nav>

      <div className="hidden shrink-0 items-center gap-2 lg:flex">
        {authLoading ? <div className="flex items-center gap-2">
          <Link href="/sign-in" aria-label="Sign in to your SalonBook account" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--border)] px-4 text-sm font-medium text-[var(--muted)] transition-colors hover:border-[var(--green-light)]/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)]"><CircleUserRound className="size-4" aria-hidden="true" />Sign in</Link>
          <Link href="/sign-up" className="rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-hover)] focus-visible:rounded-full">Get started</Link>
        </div> : user ? <div className="relative" ref={accountRef}>
          <div className="flex items-center gap-2">
            <Link href={dashboardHref} aria-current={dashboardActive ? "page" : undefined} className={`group inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold shadow-sm transition-all hover:-translate-y-px hover:shadow-[0_8px_22px_rgb(22_163_74_/_18%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] motion-reduce:transform-none motion-reduce:transition-none ${dashboardActive ? "border-[var(--green-light)]/50 bg-[var(--primary)] text-white" : "border-[var(--green-light)]/25 bg-[var(--primary)]/10 text-[var(--green-light)] hover:border-[var(--green-light)]/50 hover:bg-[var(--primary)]/20"}`}>
              <LayoutDashboard className="size-4 shrink-0 transition-transform group-hover:scale-105 motion-reduce:transition-none" aria-hidden="true" />
              {dashboardLabel}
            </Link>
            <button ref={accountButtonRef} type="button" aria-haspopup="menu" aria-expanded={accountOpen} aria-controls="account-menu" onClick={() => setAccountOpen((open) => !open)} className="flex min-h-11 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] py-1 pl-1 pr-3 text-left transition-colors hover:border-[var(--green-light)]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)]">
              <Avatar name={user.name} imageUrl={avatarUrl} />
              <span className="max-w-32 truncate text-sm font-medium">{user.name}</span>
              <ChevronDown className={`size-4 text-[var(--muted)] transition-transform motion-reduce:transition-none ${accountOpen ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
          </div>
          <div ref={accountMenuRef} id="account-menu" role="menu" aria-label="Account navigation" aria-hidden={!accountOpen} inert={!accountOpen} onKeyDown={handleAccountMenuKeyDown} className={`absolute right-0 top-[calc(100%+0.7rem)] w-64 origin-top-right rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-[0_18px_50px_rgb(0_0_0_/_35%)] transition-[opacity,transform,visibility] duration-150 motion-reduce:transition-none ${accountOpen ? "visible translate-y-0 scale-100 opacity-100" : "invisible -translate-y-1 scale-[.98] opacity-0"}`}>
            <div className="border-b border-[var(--border)] px-3 py-2.5">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="mt-0.5 text-xs capitalize text-[var(--muted)]">{user.role ?? "customer"}</p>
            </div>
            {user.role !== "admin" && <>
              <MenuLink href="/dashboard/my-appointments" onClick={() => setAccountOpen(false)}>My appointments</MenuLink>
              <MenuLink href="/transactions" onClick={() => setAccountOpen(false)}>Payments</MenuLink>
            </>}
            {user.role !== "admin" && <MenuLink href="/dashboard/profile" onClick={() => setAccountOpen(false)}>My profile</MenuLink>}
            <button role="menuitem" type="button" onClick={() => void signOut()} disabled={signingOut} className="mt-1 flex min-h-11 w-full items-center rounded-xl px-3 text-left text-sm font-medium text-red-200 transition-colors hover:bg-red-950/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)] disabled:opacity-60">
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div> : <>
          <Link href="/sign-in" className="rounded-full px-4 py-2.5 text-sm font-medium text-[var(--muted)] transition-colors hover:text-white focus-visible:rounded-full">Sign in</Link>
          <Link href="/sign-up" className="rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-hover)] focus-visible:rounded-full">Get started</Link>
        </>}
      </div>

      <button ref={mobileButtonRef} type="button" className="grid size-11 place-items-center rounded-xl border border-[var(--border)] text-[var(--foreground)] transition-colors hover:border-[var(--green-light)]/50 hover:bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)] lg:hidden" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>
        {menuOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
      </button>
    </div>

    <div id="mobile-navigation" ref={mobileMenuRef} aria-hidden={!menuOpen} inert={!menuOpen} className={`grid transition-[grid-template-rows,opacity] duration-200 motion-reduce:transition-none lg:hidden ${menuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
      <div className="min-h-0 overflow-hidden">
        <div className="border-t border-[var(--border)] bg-[var(--background)] px-4 pb-5 pt-3 sm:px-6">
          <nav aria-label="Mobile navigation" className="mx-auto flex max-w-7xl flex-col gap-1">
            <NavLink href="/" active={pathname === "/"} onClick={() => setMenuOpen(false)}>Home</NavLink>
            <NavLink href="/services" active={pathname.startsWith("/services")} onClick={() => setMenuOpen(false)}>Services</NavLink>
            <NavLink href="/about" active={pathname === "/about"} onClick={() => setMenuOpen(false)}>About</NavLink>
            <NavLink href="/contact" active={pathname === "/contact"} onClick={() => setMenuOpen(false)}>Contact</NavLink>
          </nav>
          <div className="mx-auto mt-4 max-w-7xl border-t border-[var(--border)] pt-4">
            {authLoading ? <div className="grid grid-cols-2 gap-2">
              <Link href="/sign-in" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 text-sm font-medium text-[var(--muted)] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)]"><CircleUserRound className="size-4" aria-hidden="true" />Sign in</Link>
              <Link href="/sign-up" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center justify-center rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)]">Get started</Link>
            </div> : user ? <div className="space-y-3">
              <div className="flex items-center gap-3 px-1">
                <Avatar name={user.name} imageUrl={avatarUrl} />
                <div className="min-w-0"><p className="truncate text-sm font-semibold">{user.name}</p><p className="text-xs capitalize text-[var(--muted)]">{user.role ?? "customer"}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <MobileAction href={dashboardHref} onClick={() => setMenuOpen(false)}>{dashboardLabel}</MobileAction>
                {user.role !== "admin" && <MobileAction href="/dashboard/profile" onClick={() => setMenuOpen(false)}>My profile</MobileAction>}
                {user.role !== "admin" && <>
                  <MobileAction href="/dashboard/my-appointments" onClick={() => setMenuOpen(false)}>Appointments</MobileAction>
                  <MobileAction href="/transactions" onClick={() => setMenuOpen(false)}>Payments</MobileAction>
                </>}
              </div>
              <button type="button" onClick={() => void signOut()} disabled={signingOut} className="min-h-11 w-full rounded-xl border border-[var(--border)] px-4 text-sm font-medium text-[var(--muted)] transition-colors hover:border-[var(--green-light)]/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)] disabled:opacity-60">
                {signingOut ? "Signing out…" : "Sign out"}
              </button>
            </div> : <div className="grid grid-cols-2 gap-2">
              <Link href="/sign-in" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] px-4 text-sm font-medium text-[var(--muted)] transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)]">Sign in</Link>
              <Link href="/sign-up" onClick={() => setMenuOpen(false)} className="flex min-h-11 items-center justify-center rounded-xl bg-[var(--primary)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)]">Get started</Link>
            </div>}
          </div>
        </div>
      </div>
    </div>
    {signOutError && <p role="alert" className="border-t border-red-900/70 bg-red-950/40 px-4 py-2 text-center text-xs text-red-200">{signOutError}</p>}
  </header>;
}

function Avatar({ name, imageUrl }: { name: string; imageUrl: string | null }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "U";
  return <span className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--primary)]/15 text-xs font-bold text-[var(--green-light)]" aria-hidden="true">
    {imageUrl ? <Image src={imageUrl} alt="" width={36} height={36} unoptimized className="size-full object-cover" /> : name ? initials : <CircleUserRound className="size-5" />}
  </span>;
}

function NavLink({ href, active, children, onClick }: { href: string; active: boolean; children: React.ReactNode; onClick?: () => void }) {
  return <Link href={href} onClick={onClick} aria-current={active ? "page" : undefined} className={`relative whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)] ${active ? "bg-[var(--primary)]/15 font-medium text-[var(--green-light)]" : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-white"}`}>{children}</Link>;
}

function MenuLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return <Link role="menuitem" href={href} onClick={onClick} className="flex min-h-11 items-center rounded-xl px-3 text-sm text-[var(--muted)] transition-colors hover:bg-[var(--card)] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)]">{children}</Link>;
}

function MobileAction({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return <Link href={href} onClick={onClick} className="flex min-h-11 items-center justify-center rounded-xl border border-[var(--border)] px-3 text-center text-xs font-medium text-[var(--muted)] transition-colors hover:border-[var(--green-light)]/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)]">{children}</Link>;
}
