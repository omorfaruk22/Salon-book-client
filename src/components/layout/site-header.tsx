"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/components/providers/auth-provider";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  async function signOut() {
    setSigningOut(true);
    setSignOutError("");
    try {
      const result = await authClient.signOut();
      if (result.error) throw new Error("We could not end your session. Please try again.");
      router.replace("/sign-in");
      router.refresh();
    } catch {
      setSignOutError("We could not end your session. Please try again.");
    } finally { setSigningOut(false); }
  }

  const navigation = <>
    <NavLink href="/services" active={pathname.startsWith("/services")}>Services</NavLink>
    {user && <><NavLink href="/dashboard" active={pathname === "/dashboard"}>Dashboard</NavLink><NavLink href="/appointments" active={pathname === "/appointments"}>Appointments</NavLink><NavLink href="/transactions" active={pathname === "/transactions"}>Payments</NavLink><NavLink href="/profile" active={pathname === "/profile"}>Profile</NavLink>{user.role === "admin" && <NavLink href="/admin" active={pathname.startsWith("/admin")}>Admin</NavLink>}</>}
  </>;

  return <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-xl">
    <div className="mx-auto flex min-h-[4.25rem] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
      <Link href="/" className="shrink-0 text-xl font-bold tracking-tight">Salon<span className="text-[var(--green-light)]">Book</span></Link>
      <nav aria-label="Main navigation" className="hidden min-w-0 items-center gap-1 overflow-x-auto text-sm lg:flex">{navigation}</nav>
      <div className="hidden shrink-0 items-center gap-2 lg:flex">{authLoading ? <span className="px-4 py-2.5 text-sm text-[var(--muted)]">Loading…</span> : user ? <button onClick={() => void signOut()} disabled={signingOut} className="rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:border-[var(--green-light)]/60 hover:text-white disabled:opacity-60">{signingOut ? "Signing out…" : "Sign out"}</button> : <><Link href="/sign-in" className="rounded-full px-4 py-2.5 text-sm font-medium text-[var(--muted)] transition hover:text-white">Sign in</Link><Link href="/sign-up" className="rounded-full bg-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--primary-hover)]">Join</Link></>}</div>
      <button type="button" className="grid size-10 place-items-center rounded-xl border border-[var(--border)] text-[var(--foreground)] transition hover:border-[var(--green-light)]/50 hover:bg-[var(--surface)] lg:hidden" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}</button>
    </div>
    {menuOpen && <div id="mobile-navigation" className="border-t border-[var(--border)] bg-[var(--background)] px-4 pb-5 pt-3 sm:px-6 lg:hidden">
      <nav aria-label="Mobile navigation" className="mx-auto flex max-w-7xl flex-col gap-1">{navigation}</nav>
      <div className="mx-auto mt-4 flex max-w-7xl gap-2 border-t border-[var(--border)] pt-4">{authLoading ? <span className="w-full py-3 text-center text-sm text-[var(--muted)]">Loading account…</span> : user ? <button onClick={() => void signOut()} disabled={signingOut} className="w-full rounded-xl border border-[var(--border)] px-4 py-3 text-sm font-medium text-[var(--muted)] hover:text-white disabled:opacity-60">{signingOut ? "Signing out…" : "Sign out"}</button> : <><Link href="/sign-in" className="flex-1 rounded-xl border border-[var(--border)] px-4 py-3 text-center text-sm font-medium text-[var(--muted)] hover:text-white">Sign in</Link><Link href="/sign-up" className="flex-1 rounded-xl bg-[var(--primary)] px-4 py-3 text-center text-sm font-semibold text-white hover:bg-[var(--primary-hover)]">Join SalonBook</Link></>}</div>
    </div>}
    {signOutError && <p role="alert" className="border-t border-red-900/70 bg-red-950/40 px-4 py-2 text-center text-xs text-red-200">{signOutError}</p>}
  </header>;
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return <Link href={href} aria-current={active ? "page" : undefined} className={`whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm transition ${active ? "bg-[var(--primary)]/15 text-[var(--green-light)]" : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-white"}`}>{children}</Link>;
}
