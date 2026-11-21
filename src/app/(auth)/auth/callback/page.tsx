"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { authClient } from "@/lib/auth-client";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const { user, isLoading, profileError, refreshSession } = useAuth();
  const recheckedSession = useRef(false);

  useEffect(() => {
    if (isLoading) return;
    if (profileError?.status === 403) {
      void authClient.signOut().catch(() => undefined).finally(() => router.replace("/sign-in?error=blocked"));
      return;
    }
    if (profileError) return;
    if (!user) {
      // OAuth redirects back to the app immediately after the provider writes
      // the session cookie. Re-read that cookie once before treating the
      // callback as a failed sign-in, in case the initial session query raced
      // the redirect or used a stale client state.
      if (!recheckedSession.current) {
        recheckedSession.current = true;
        void refreshSession().catch(() => undefined);
        return;
      }
      router.replace("/sign-in?error=google");
      return;
    }
    recheckedSession.current = false;
    const requestedNext = new URLSearchParams(window.location.search).get("next");
    const safeNext = requestedNext && /^\/services\/[a-f\d]{24}$/i.test(requestedNext) ? requestedNext : null;
    router.replace(user.role === "admin" ? "/admin" : safeNext ?? "/dashboard");
  }, [isLoading, profileError, refreshSession, router, user]);

  return <main className="mx-auto flex min-h-[55vh] max-w-5xl items-center justify-center px-6">
    <p role={profileError ? "alert" : undefined} className={profileError ? "rounded-xl border border-red-900/70 bg-red-950/40 px-5 py-4 text-sm text-red-200" : "text-sm text-[var(--muted)]"}>
      {profileError?.message ?? "Finishing secure sign-in…"}
    </p>
  </main>;
}
