"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/components/providers/auth-provider";

export function AuthGate({ children, role }: { children: React.ReactNode; role: "customer" | "admin" }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, profileError, refreshSession } = useAuth();
  const recheckedEmptySessionFor = useRef<string | null>(null);

  useEffect(() => {
    if (isLoading) return;
    if (profileError?.status === 403) {
      void authClient.signOut().catch(() => undefined).finally(() => router.replace("/sign-in?error=blocked"));
      return;
    }
    if (profileError?.status === 401) {
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (profileError) return;
    if (!user) {
      // A hard refresh starts with an empty client-side session cache. Recheck
      // the cookie-backed session once before redirecting, so a transient or
      // cold-start response cannot make a signed-in dashboard look signed out.
      if (recheckedEmptySessionFor.current !== pathname) {
        recheckedEmptySessionFor.current = pathname;
        void refreshSession().catch(() => undefined);
        return;
      }
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
      return;
    }
    recheckedEmptySessionFor.current = null;
    if (user.role !== role) {
      if (role === "admin" && user.role === "customer") router.replace("/dashboard?notice=admin-only");
      else router.replace("/admin?notice=customer-only");
    }
  }, [isLoading, pathname, profileError, refreshSession, role, router, user]);

  if (profileError) return <main className="mx-auto flex min-h-[50vh] max-w-5xl items-center justify-center px-6"><p role="alert" className="rounded-xl border border-red-900/70 bg-red-950/40 px-5 py-4 text-sm text-red-200">{profileError.message}</p></main>;
  if (isLoading || !user || user.role !== role) return <main className="mx-auto flex min-h-[50vh] max-w-5xl items-center justify-center px-6"><p className="text-sm text-[var(--muted)]">Checking account access…</p></main>;
  return children;
}
