"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import type { ApiEnvelope } from "@/types/service";
import type { SalonUser } from "@/types/appointment";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SalonUser | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;
    void apiFetch("/users/me").then(async (response) => {
      if (!response.ok) return null;
      const result = (await response.json()) as ApiEnvelope<SalonUser>;
      return result.data;
    }).then((profile) => { if (active) setUser(profile); }).catch(() => { if (active) setUser(null); });
    return () => { active = false; };
  }, [pathname]);

  async function signOut() {
    setSigningOut(true);
    try { await fetch(`${apiBase}/auth/sign-out`, { method: "POST", credentials: "include" }); }
    finally { setUser(null); setSigningOut(false); router.push("/login"); router.refresh(); }
  }

  return <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur">
    <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3">
      <Link href="/" className="shrink-0 text-lg font-bold tracking-tight">Salon<span className="text-[var(--green-light)]">Book</span></Link>
      <nav aria-label="Main navigation" className="flex min-w-0 items-center gap-1 overflow-x-auto text-sm">
        <NavLink href="/services" active={pathname.startsWith("/services")}>Services</NavLink>
        {user && <><NavLink href="/dashboard" active={pathname === "/dashboard"}>Dashboard</NavLink><NavLink href="/appointments" active={pathname === "/appointments"}>Appointments</NavLink><NavLink href="/transactions" active={pathname === "/transactions"}>Payments</NavLink><NavLink href="/profile" active={pathname === "/profile"}>Profile</NavLink>{user.role === "admin" && <NavLink href="/admin" active={pathname.startsWith("/admin")}>Admin</NavLink>}</>}
      </nav>
      <div className="flex shrink-0 items-center gap-2">{user ? <button onClick={() => void signOut()} disabled={signingOut} className="rounded-full border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--muted)] hover:border-[var(--green-light)] hover:text-white">{signingOut ? "Signing out…" : "Sign out"}</button> : <><Link href="/login" className="rounded-full px-3 py-2 text-xs font-medium text-[var(--muted)] hover:text-white">Sign in</Link><Link href="/register" className="rounded-full bg-[var(--primary)] px-3 py-2 text-xs font-semibold hover:bg-[var(--primary-hover)]">Join</Link></>}</div>
    </div>
  </header>;
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return <Link href={href} className={`whitespace-nowrap rounded-full px-3 py-2 transition ${active ? "bg-[var(--primary)]/15 text-[var(--green-light)]" : "text-[var(--muted)] hover:bg-[var(--surface)] hover:text-white"}`}>{children}</Link>;
}
