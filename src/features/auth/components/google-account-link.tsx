"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Link2, LoaderCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function GoogleAccountLink({ email }: { email: string }) {
  const [connected, setConnected] = useState(false);
  const [checking, setChecking] = useState(true);
  const [linking, setLinking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAccounts = useCallback(async () => {
    try {
      const result = await authClient.listAccounts();
      if (result.error) throw new Error(result.error.message || "Could not check connected sign-in methods.");
      setConnected((result.data ?? []).some((account) => account.providerId === "google"));
    } catch {
      // Keep the connect action available if the account list cannot be fetched.
      setConnected(false);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    const url = new URL(window.location.href);
    const linkResult = url.searchParams.get("google-link");
    if (linkResult === "success") setMessage("Google is connected. You can use it to sign in next time.");
    if (linkResult === "error") setError("Google could not be connected. Choose the Google account with the same email as your SalonBook account.");
    if (linkResult) {
      url.searchParams.delete("google-link");
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    }
    void loadAccounts();
  }, [loadAccounts]);

  async function connectGoogle() {
    setLinking(true);
    setError("");
    setMessage("");
    try {
      const successURL = new URL(window.location.href);
      successURL.searchParams.set("google-link", "success");
      const errorURL = new URL(window.location.href);
      errorURL.searchParams.set("google-link", "error");

      const result = await authClient.linkSocial({
        provider: "google",
        callbackURL: successURL.toString(),
        errorCallbackURL: errorURL.toString(),
        loginHint: email,
      });
      if (result.error) {
        throw new Error(result.error.message || "Could not connect Google.");
      }
      if (result.data?.url) {
        window.location.assign(result.data.url);
        return;
      }
      if (result.data?.redirect === false) {
        setError("Google authorization did not return a sign-in link. Please try again.");
      }
    } catch (cause) {
      const detail = cause instanceof Error ? cause.message.toLowerCase() : "";
      setError(detail.includes("email")
        ? `Choose the Google account that uses ${email}.`
        : "Could not connect Google right now. Try again in a moment.");
    } finally {
      setLinking(false);
    }
  }

  return <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-semibold">Google sign-in</p>
        <p className="mt-1 text-sm leading-5 text-[var(--muted)]">
          {connected
            ? "Google is connected to this SalonBook account."
            : "Connect the Google account that uses this same email so you can sign in either way."}
        </p>
      </div>
      {connected ? <span className="inline-flex min-h-10 shrink-0 items-center gap-2 rounded-xl bg-[var(--primary)]/15 px-4 text-sm font-semibold text-[var(--green-light)]"><CheckCircle2 className="size-4" aria-hidden="true" />Connected</span>
        : <button type="button" onClick={() => void connectGoogle()} disabled={checking || linking} className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 text-sm font-semibold text-[var(--green-light)] transition hover:border-[var(--green-light)]/60 disabled:cursor-wait disabled:opacity-60">
          {linking || checking ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <Link2 className="size-4" aria-hidden="true" />}
          {checking ? "Checking…" : linking ? "Connecting…" : "Connect Google"}
        </button>}
    </div>
    {message && <p role="status" className="mt-3 rounded-xl border border-emerald-900/70 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-200">{message}</p>}
    {error && <p role="alert" className="mt-3 rounded-xl border border-red-900/70 bg-red-950/35 px-3 py-2 text-sm text-red-200">{error}</p>}
  </section>;
}
