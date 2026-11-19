"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useAuth } from "@/components/providers/auth-provider";

export function AuthGate({ children, role }: { children: React.ReactNode; role: "customer" | "admin" }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, profileError } = useAuth();

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
      router.replace(`/sign-in?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user.role !== role) router.replace(user.role === "admin" ? "/admin" : "/dashboard");
  }, [isLoading, pathname, profileError, role, router, user]);

  if (profileError) return <main className="mx-auto flex min-h-[50vh] max-w-5xl items-center justify-center px-6"><p role="alert" className="rounded-xl border border-red-900/70 bg-red-950/40 px-5 py-4 text-sm text-red-200">{profileError.message}</p></main>;
  if (isLoading || !user || user.role !== role) return <main className="mx-auto flex min-h-[50vh] max-w-5xl items-center justify-center px-6"><p className="text-sm text-[var(--muted)]">Checking account access…</p></main>;
  return children;
}
