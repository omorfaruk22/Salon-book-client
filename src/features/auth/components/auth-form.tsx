"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthFormProps = { mode: "login" | "register" };
type AuthResponse = { message?: string; error?: { message?: string } };
const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const endpoint = isRegister ? "sign-up/email" : "sign-in/email";

    try {
      const response = await fetch(`${apiBase}/auth/${endpoint}`, {
        method: "POST", credentials: "include", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isRegister ? { name, email, password } : { email, password }),
      });
      const body = await response.text();
      let result: AuthResponse;
      try {
        result = body ? JSON.parse(body) as AuthResponse : {};
      } catch {
        throw new Error(response.status >= 500 ? "SalonBook’s API is temporarily unavailable. Please try again in a moment." : "The server returned an unexpected response. Please check the API configuration.");
      }
      if (!response.ok) throw new Error(result.error?.message ?? result.message ?? "Could not sign in.");
      const next = new URLSearchParams(window.location.search).get("next");
      const destination = !isRegister && next?.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
      router.push(destination);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={handleSubmit} className="mt-7 space-y-5" aria-busy={busy}>
    {isRegister && <Field label="Full name" name="name" autoComplete="name" required />}
    <Field label="Email address" name="email" type="email" autoComplete="email" required />
    <Field label="Password" name="password" type="password" autoComplete={isRegister ? "new-password" : "current-password"} minLength={8} required />
    {error && <p role="alert" className="rounded-xl border border-red-900/70 bg-red-950/40 px-4 py-3 text-sm text-red-200">{error}</p>}
    <Button type="submit" size="lg" className="w-full" disabled={busy}>
      {busy ? "Please wait…" : isRegister ? "Create account" : "Sign in"}
    </Button>
    <p className="text-center text-sm text-[var(--muted)]">{isRegister ? "Already have an account? " : "New to SalonBook? "}
      <Link className="font-medium text-[var(--green-light)] hover:underline" href={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link>
    </p>
  </form>;
}

function Field(props: { label: string; name: string; type?: string; autoComplete: string; minLength?: number; required?: boolean }) {
  return <label className="block space-y-2 text-sm font-medium text-[var(--foreground)]"><span>{props.label}</span>
    <Input name={props.name} type={props.type ?? "text"} autoComplete={props.autoComplete} minLength={props.minLength} required={props.required} />
  </label>;
}
