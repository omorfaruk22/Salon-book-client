"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { apiFetch } from "@/lib/api-client";
import type { SalonUser } from "@/types/appointment";
import type { ApiEnvelope } from "@/types/service";

type AuthContextValue = {
  user: SalonUser | null;
  avatarUrl: string | null;
  isLoading: boolean;
  profileError: { message: string; status?: number } | null;
  refreshProfile: (authUserId?: string) => Promise<ProfileResult>;
};
type ProfileResult = { user: SalonUser; error?: never } | { user?: never; error: { message: string; status?: number } };

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const sessionState = authClient.useSession();
  const sessionUserId = sessionState.data?.user.id;
  const avatarUrl = sessionState.data?.user.image ?? null;
  const [user, setUser] = useState<SalonUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<AuthContextValue["profileError"]>(null);
  const profileRequest = useRef<{ userId: string; promise: Promise<ProfileResult> } | null>(null);
  const currentSessionUserId = useRef(sessionUserId);
  currentSessionUserId.current = sessionUserId;

  const refreshProfile = useCallback((requestedUserId?: string) => {
    const requestedId = requestedUserId ?? sessionUserId;
    if (!requestedId) {
      setUser(null);
      setProfileError(null);
      return Promise.resolve({ error: { message: "Sign in to continue." } } as ProfileResult);
    }
    if (profileRequest.current?.userId === requestedId) return profileRequest.current.promise;

    setProfileLoading(true);
    setProfileError(null);
    const promise = (async (): Promise<ProfileResult> => {
      try {
        const response = await apiFetch("/users/me", { cache: "no-store" });
        const result = await response.json() as ApiEnvelope<SalonUser>;
        if (!response.ok) {
          throw Object.assign(new Error(result.error?.message ?? "Could not load your account."), { status: response.status });
        }
        if (currentSessionUserId.current === requestedId) setUser(result.data);
        return { user: result.data };
      } catch (cause) {
        const failure = {
          message: cause instanceof Error ? cause.message : "Could not load your account.",
          status: typeof cause === "object" && cause !== null && "status" in cause ? Number((cause as { status: unknown }).status) : undefined,
        };
        if (currentSessionUserId.current === requestedId) {
          setUser(null);
          setProfileError(failure);
        }
        return { error: failure };
      } finally {
        if (profileRequest.current?.userId === requestedId) {
          setProfileLoading(false);
          profileRequest.current = null;
        }
      }
    })();
    profileRequest.current = { userId: requestedId, promise };
    return promise;
  }, [sessionUserId]);

  useEffect(() => {
    if (sessionState.isPending) return;
    if (!sessionUserId) {
      profileRequest.current = null;
      setUser(null);
      setProfileError(null);
      setProfileLoading(false);
      return;
    }
    void refreshProfile();
  }, [refreshProfile, sessionState.isPending, sessionUserId]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    avatarUrl,
    isLoading: sessionState.isPending || (!!sessionUserId && profileLoading),
    profileError,
    refreshProfile,
  }), [user, avatarUrl, sessionState.isPending, sessionUserId, profileLoading, profileError, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
