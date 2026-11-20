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
  refreshSession: () => Promise<void>;
  refreshProfile: (authUserId?: string, force?: boolean) => Promise<ProfileResult>;
};
type ProfileResult = { user: SalonUser; error?: never } | { user?: never; error: { message: string; status?: number } };

const AuthContext = createContext<AuthContextValue | null>(null);
const MAX_SESSION_RETRIES = 2;

function getErrorStatus(error: unknown) {
  if (typeof error !== "object" || error === null) return undefined;
  const status = "status" in error ? error.status : "statusCode" in error ? error.statusCode : undefined;
  return typeof status === "number" ? status : undefined;
}

function isSessionUnavailable(error: unknown) {
  return getErrorStatus(error) === 401 || (error instanceof Error && /session has expired/i.test(error.message));
}

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const sessionState = authClient.useSession();
  const { error: sessionError, isPending: sessionPending, isRefetching: sessionRefetching, refetch: refetchSession } = sessionState;
  const sessionUserId = sessionState.data?.user.id;
  const sessionAvatarUrl = sessionState.data?.user.image ?? null;
  const [user, setUser] = useState<SalonUser | null>(null);
  const avatarUrl = user?.imageUrl ?? sessionAvatarUrl;
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<AuthContextValue["profileError"]>(null);
  const [sessionRetryCount, setSessionRetryCount] = useState(0);
  const [sessionRetrying, setSessionRetrying] = useState(false);
  const profileRequest = useRef<{ userId: string; promise: Promise<ProfileResult>; token: object } | null>(null);
  const currentSessionUserId = useRef(sessionUserId);
  currentSessionUserId.current = sessionUserId;

  const sessionErrorStatus = getErrorStatus(sessionError);
  const hasSessionErrorToRetry = Boolean(sessionError) && sessionRetryCount < MAX_SESSION_RETRIES;

  useEffect(() => {
    if (!sessionError || sessionPending || sessionRefetching || sessionRetrying || sessionUserId) {
      if (!sessionError || sessionUserId) setSessionRetryCount(0);
      return;
    }
    if (sessionRetryCount >= MAX_SESSION_RETRIES) return;

    const retryTimer = window.setTimeout(() => {
      setSessionRetryCount((count) => count + 1);
      setSessionRetrying(true);
      void refetchSession().catch(() => undefined).finally(() => setSessionRetrying(false));
    }, 500 * (sessionRetryCount + 1));

    return () => window.clearTimeout(retryTimer);
  }, [sessionErrorStatus, sessionRetryCount, sessionError, sessionPending, sessionRefetching, refetchSession, sessionRetrying, sessionUserId]);

  const refreshProfile = useCallback((requestedUserId?: string, force = false) => {
    const requestedId = requestedUserId ?? sessionUserId;
    if (!requestedId) {
      setUser(null);
      setProfileError(null);
      return Promise.resolve({ error: { message: "Sign in to continue." } } as ProfileResult);
    }
    if (!force && profileRequest.current?.userId === requestedId) return profileRequest.current.promise;

    setProfileLoading(true);
    setProfileError(null);
    const requestToken = {};
    const promise = (async (): Promise<ProfileResult> => {
      try {
        let response: Response;
        try {
          response = await apiFetch("/users/me", { cache: "no-store" });
        } catch (cause) {
          if (!isSessionUnavailable(cause)) throw cause;
          await refetchSession();
          response = await apiFetch("/users/me", { cache: "no-store" });
        }
        if (response.status === 401) {
          // A short-lived API JWT can expire or be rejected while the
          // cookie-backed Better Auth session is still valid. Revalidate that
          // session and request a fresh JWT once before treating the user as
          // signed out.
          await refetchSession();
          response = await apiFetch("/users/me", { cache: "no-store" });
        }
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
        if (profileRequest.current?.token === requestToken) {
          setProfileLoading(false);
          profileRequest.current = null;
        }
      }
    })();
    profileRequest.current = { userId: requestedId, promise, token: requestToken };
    return promise;
  }, [refetchSession, sessionUserId]);

  const refreshSession = useCallback(() => refetchSession(), [refetchSession]);

  useEffect(() => {
    if (sessionPending || sessionRefetching || sessionRetrying) return;
    if (!sessionUserId) {
      profileRequest.current = null;
      setUser(null);
      setProfileLoading(false);
      if (sessionError) {
        if (sessionRetryCount < MAX_SESSION_RETRIES) {
          setProfileError(null);
          return;
        }
        if (sessionErrorStatus === 401) {
          setProfileError({ message: "Your session has expired. Please sign in again.", status: 401 });
        } else if (sessionRetryCount >= MAX_SESSION_RETRIES) {
          setProfileError({ message: "Could not verify your session because the server is temporarily unavailable. Refresh the page in a moment.", status: sessionErrorStatus });
        } else {
          setProfileError(null);
        }
        return;
      }
      setProfileError(null);
      setSessionRetryCount(0);
      return;
    }
    setSessionRetryCount(0);
    void refreshProfile();
  }, [refreshProfile, sessionErrorStatus, sessionRetryCount, sessionError, sessionPending, sessionRefetching, sessionRetrying, sessionUserId]);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    avatarUrl,
    isLoading: sessionPending || sessionRefetching || sessionRetrying || hasSessionErrorToRetry || (!!sessionUserId && profileLoading),
    profileError,
    refreshSession,
    refreshProfile,
  }), [user, avatarUrl, sessionPending, sessionRefetching, sessionRetrying, hasSessionErrorToRetry, sessionUserId, profileLoading, profileError, refreshSession, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}
