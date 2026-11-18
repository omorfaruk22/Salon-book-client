"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-client";
import type { ApiEnvelope } from "@/types/service";
import type { SalonUser } from "@/types/appointment";

export function AuthGate({ children, role }: { children: React.ReactNode; role: "customer" | "admin" }) {
  const router = useRouter();
  const pathname = usePathname();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let active = true;
    setAllowed(false);
    void apiFetch("/users/me").then(async (response) => {
      const result = (await response.json()) as ApiEnvelope<SalonUser>;
      if (!response.ok) throw new Error(result.error?.message ?? "Sign in required");
      const hasAccess = role === "customer" || result.data.role === "admin";
      if (!hasAccess) { router.replace("/dashboard"); return; }
      if (active) setAllowed(true);
    }).catch(() => { if (active) router.replace(`/login?next=${encodeURIComponent(pathname)}`); });
    return () => { active = false; };
  }, [pathname, role, router]);

  if (!allowed) return <main className="mx-auto flex min-h-[50vh] max-w-5xl items-center justify-center px-6"><p className="text-sm text-[var(--muted)]">Checking account access…</p></main>;
  return children;
}
