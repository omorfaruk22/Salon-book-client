"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/auth-provider";
import { authClient } from "@/lib/auth-client";

export default function OAuthCallbackPage() {
  const router = useRouter();
  const { user, isLoading, profileError } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (profileError?.status === 403) {
      void authClient.signOut().catch(() => undefined).finally(() => router.replace("/sign-in?error=blocked"));
      return;
    }
    if (profileError) return;
    if (!user) {
      router.replace("/sign-in?error=google");
      return;
    }
    router.replace(user.role === "admin" ? "/admin" : "/dashboard");
  }, [isLoading, profileError, router, user]);

  return <main className="mx-auto flex min-h-[55vh] max-w-5xl items-center justify-center px-6">
    <p role={profileError ? "alert" : undefined} className={profileError ? "rounded-xl border border-red-900/70 bg-red-950/40 px-5 py-4 text-sm text-red-200" : "text-sm text-[var(--muted)]"}>
      {profileError?.message ?? "Finishing secure sign-in…"}
    </p>
  </main>;
}
