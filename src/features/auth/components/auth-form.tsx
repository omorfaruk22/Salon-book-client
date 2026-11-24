"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";
import { authClient } from "@/lib/auth-client";
import { isTransientHttpStatus, retryTransient } from "@/lib/retry-transient";

type AuthFormProps = { mode: "login" | "register" };

const emailSchema = z.string().trim().email("Enter a valid email address.").max(254);
const passwordSchema = z.string()
  .min(8, "Use at least 8 characters.")
  .max(128, "Password is too long.")
  .regex(/[A-Z]/, "Add at least one uppercase letter.")
  .regex(/[a-z]/, "Add at least one lowercase letter.");

const loginSchema = z.object({ email: emailSchema, password: z.string().min(1, "Enter your password.") });
const registrationSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(100, "Name is too long."),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Confirm your password."),
  imageUrl: z.union([z.literal(""), z.string().url("Enter a valid image URL.").refine((value) => /^https?:\/\//i.test(value), "Use an HTTP or HTTPS image URL.")]),
}).refine((values) => values.password === values.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords do not match.",
});

type LoginValues = z.infer<typeof loginSchema>;
type RegistrationValues = z.infer<typeof registrationSchema>;
type AuthError = { message?: string; code?: string | null; status?: number; statusCode?: number };
const authRetryDelays = [3_000, 7_000, 12_000, 15_000, 20_000] as const;

export function AuthForm({ mode }: AuthFormProps) {
  return mode === "register" ? <RegistrationForm /> : <LoginForm />;
}

function LoginForm() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  useEffect(() => {
    if (!error.toLowerCase().startsWith("too many ")) return;
    const timeout = window.setTimeout(() => {
      setError((current) => current === error ? "" : current);
    }, 10_000);
    return () => window.clearTimeout(timeout);
  }, [error]);

  useEffect(() => {
    const queryError = new URLSearchParams(window.location.search).get("error");
    if (queryError === "blocked") setError("This account is blocked. Contact the salon administrator.");
    if (queryError === "google") setError("Google sign-in was cancelled or could not be completed. Try again or use email and password.");
  }, []);

  async function submit(values: LoginValues) {
    setError("");
    try {
      const result = await retryAuthRequest(
        () => authClient.signIn.email({ email: values.email, password: values.password }),
        (response) => response.error,
      );
      if (result.error) { setError(authErrorMessage(result.error, "login")); return; }

      const profileResult = await refreshProfile(result.data.user.id);
      if (profileResult.error) {
        await authClient.signOut();
        setError(profileResult.error.status === 403
          ? "This account is blocked. Contact the salon administrator."
          : "We signed you in but could not load your profile. Please try again.");
        return;
      }

      const next = new URLSearchParams(window.location.search).get("next");
      const safeNext = safeInternalPath(next);
      const destination = profileResult.user.role === "admin"
        ? safeNext && isAdminPath(safeNext) ? safeNext : "/admin"
        : safeNext && isAdminPath(safeNext) ? "/dashboard?notice=admin-only"
          : safeNext ?? "/dashboard";
      router.replace(destination);
      router.refresh();
    } catch (cause) {
      setError(authErrorMessage(readAuthError(cause), "login"));
    }
  }

  return <form onSubmit={form.handleSubmit(submit)} className="mt-7 space-y-5" aria-busy={form.formState.isSubmitting} noValidate>
    <TextField label="Email address" type="email" autoComplete="email" error={form.formState.errors.email?.message} {...form.register("email")} />
    <PasswordField label="Password" autoComplete="current-password" visible={showPassword} onToggle={() => setShowPassword((value) => !value)} error={form.formState.errors.password?.message} {...form.register("password")} />
    {error && <ErrorMessage>{error}</ErrorMessage>}
    <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
      {form.formState.isSubmitting ? <><LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Signing in…</> : "Sign in"}
    </Button>
    <GoogleSignIn onError={setError} />
    <p className="text-center text-sm text-[var(--muted)]">New to SalonBook? <Link className="font-medium text-[var(--green-light)] hover:underline" href="/sign-up">Create an account</Link></p>
  </form>;
}

function RegistrationForm() {
  const router = useRouter();
  const { refreshProfile } = useAuth();
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const form = useForm<RegistrationValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "", imageUrl: "" },
  });

  useEffect(() => {
    if (!error.toLowerCase().startsWith("too many ")) return;
    const timeout = window.setTimeout(() => {
      setError((current) => current === error ? "" : current);
    }, 10_000);
    return () => window.clearTimeout(timeout);
  }, [error]);

  async function submit(values: RegistrationValues) {
    setError("");
    try {
      const result = await authClient.signUp.email({
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
        ...(values.imageUrl ? { image: values.imageUrl } : {}),
        callbackURL: `${window.location.origin}/auth/callback`,
      });
      if (result.error) { setError(authErrorMessage(result.error, "register")); return; }

      const profileResult = await refreshProfile(result.data.user.id);
      if (profileResult.error) {
        await authClient.signOut();
        setError(profileResult.error.message || "Your account was created, but your profile could not be loaded. Please sign in again.");
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    } catch (cause) {
      setError(authErrorMessage(readAuthError(cause), "register"));
    }
  }

  return <form onSubmit={form.handleSubmit(submit)} className="mt-7 space-y-5" aria-busy={form.formState.isSubmitting} noValidate>
    <TextField label="Full name" autoComplete="name" error={form.formState.errors.name?.message} {...form.register("name")} />
    <TextField label="Email address" type="email" autoComplete="email" error={form.formState.errors.email?.message} {...form.register("email")} />
    <PasswordField label="Password" autoComplete="new-password" visible={showPassword} onToggle={() => setShowPassword((value) => !value)} hint="At least 8 characters, with uppercase and lowercase letters." error={form.formState.errors.password?.message} {...form.register("password")} />
    <PasswordField label="Confirm password" autoComplete="new-password" visible={showConfirmation} onToggle={() => setShowConfirmation((value) => !value)} error={form.formState.errors.confirmPassword?.message} {...form.register("confirmPassword")} />
    <TextField label="Profile image URL (optional)" type="url" autoComplete="url" placeholder="https://example.com/photo.jpg" error={form.formState.errors.imageUrl?.message} {...form.register("imageUrl")} />
    {error && <ErrorMessage>{error}</ErrorMessage>}
    <Button type="submit" size="lg" className="w-full" disabled={form.formState.isSubmitting}>
      {form.formState.isSubmitting ? <><LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Creating account…</> : "Create account"}
    </Button>
    <GoogleSignIn onError={setError} />
    <p className="text-center text-sm text-[var(--muted)]">Already have an account? <Link className="font-medium text-[var(--green-light)] hover:underline" href="/sign-in">Sign in</Link></p>
  </form>;
}

function TextField({ label, error, ...props }: React.ComponentProps<typeof Input> & { label: string; error?: string }) {
  const id = props.name;
  return <label htmlFor={id} className="block space-y-2 text-sm font-medium text-[var(--foreground)]">
    <span>{label}</span>
    <Input id={id} {...props} invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} />
    {error && <span id={`${id}-error`} className="block text-xs font-normal text-red-300">{error}</span>}
  </label>;
}

function PasswordField({ label, error, visible, onToggle, hint, ...props }: React.ComponentProps<typeof Input> & { label: string; error?: string; visible: boolean; onToggle: () => void; hint?: string }) {
  const id = props.name;
  return <label htmlFor={id} className="block space-y-2 text-sm font-medium text-[var(--foreground)]">
    <span>{label}</span>
    <span className="relative block">
      <Input id={id} {...props} type={visible ? "text" : "password"} invalid={Boolean(error)} className="pr-12" aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} />
      <button type="button" className="absolute inset-y-0 right-2 grid w-10 place-items-center rounded-lg text-[var(--muted)] transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)]" onClick={onToggle} aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>
        {visible ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
      </button>
    </span>
    {hint && !error && <span id={`${id}-hint`} className="block text-xs font-normal text-[var(--muted)]">{hint}</span>}
    {error && <span id={`${id}-error`} className="block text-xs font-normal text-red-300">{error}</span>}
  </label>;
}

function ErrorMessage({ children }: { children: React.ReactNode }) {
  return <p role="alert" className="rounded-xl border border-red-900/70 bg-red-950/40 px-4 py-3 text-sm text-red-200">{children}</p>;
}

function GoogleSignIn({ onError }: { onError: (message: string) => void }) {
  const [loading, setLoading] = useState(false);
  async function signInWithGoogle() {
    setLoading(true);
    onError("");
    try {
      const next = safeServiceNext(new URLSearchParams(window.location.search).get("next"));
      const callbackUrl = new URL("/auth/callback", window.location.origin);
      const errorCallbackUrl = new URL("/sign-in", window.location.origin);
      if (next) {
        callbackUrl.searchParams.set("next", next);
        errorCallbackUrl.searchParams.set("next", next);
      }
      errorCallbackUrl.searchParams.set("error", "google");
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: callbackUrl.toString(),
        errorCallbackURL: errorCallbackUrl.toString(),
        newUserCallbackURL: callbackUrl.toString(),
      });
      if (result.error) onError(authErrorMessage(result.error, "google"));
      else if (result.data?.url) window.location.assign(result.data.url);
      else onError("Google sign-in is not configured yet. Please contact the site administrator or use email and password.");
    } catch (cause) {
      onError(cause instanceof Error ? authErrorMessage({ message: cause.message }, "google") : "Google sign-in could not be completed. Try email and password instead.");
    } finally {
      setLoading(false);
    }
  }
  return <div className="space-y-4">
    <div className="flex items-center gap-3 text-xs text-[var(--muted)]"><span className="h-px flex-1 bg-[var(--border)]" /><span>OR</span><span className="h-px flex-1 bg-[var(--border)]" /></div>
    <Button type="button" variant="secondary" className="w-full" onClick={() => void signInWithGoogle()} disabled={loading}>
      {loading && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />} Continue with Google
    </Button>
  </div>;
}

function safeServiceNext(value: string | null) {
  return value && /^\/services\/[a-f\d]{24}$/i.test(value) ? value : null;
}

function safeInternalPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /[\u0000-\u001f]/.test(value)) return null;
  try {
    const target = new URL(value, window.location.origin);
    if (target.origin !== window.location.origin) return null;
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return null;
  }
}

function isAdminPath(value: string) {
  return value === "/admin" || value.startsWith("/admin/");
}

function retryAuthRequest<T>(operation: () => Promise<T>, getError: (result: T) => AuthError | null | undefined) {
  const shouldRetry = (error: AuthError | null | undefined) => {
    if (!error) return false;
    const status = authErrorStatus(error);
    if (status === 429) return false;
    if (status !== undefined) return status === 0 || isTransientHttpStatus(status);
    return /failed to fetch|network error|networkerror|load failed|bad gateway|service unavailable|temporarily unavailable|unexpected token|doctype/i.test(error.message ?? "");
  };

  return retryTransient(async () => {
    try {
      return await operation();
    } catch (cause) {
      const failure = readAuthError(cause);
      if (!shouldRetry(failure)) throw cause;
      const retryableError = cause instanceof Error ? cause : new Error(failure.message || "Authentication service unavailable.");
      throw Object.assign(retryableError, { status: authErrorStatus(failure) || 503 });
    }
  }, (result) => shouldRetry(getError(result)), undefined, {
    delays: authRetryDelays,
    shouldRetryError: (cause) => shouldRetry(readAuthError(cause)),
  });
}

function readAuthError(error: unknown): AuthError {
  if (!error || typeof error !== "object") return { message: error instanceof Error ? error.message : "" };
  const value = error as Record<string, unknown>;
  return {
    message: typeof value.message === "string" ? value.message : "",
    code: typeof value.code === "string" ? value.code : null,
    ...(typeof value.status === "number" ? { status: value.status } : {}),
    ...(typeof value.statusCode === "number" ? { statusCode: value.statusCode } : {}),
  };
}

function authErrorStatus(error: AuthError) {
  return error.status ?? error.statusCode;
}

function authErrorMessage(error: AuthError, kind: "login" | "register" | "google") {
  const code = (error.code ?? "").toUpperCase();
  const message = (error.message ?? "").toLowerCase();
  const status = authErrorStatus(error);
  if (kind === "register" && (status === 409 || code.includes("EXISTS") || message.includes("already exists") || message.includes("already registered"))) {
    return "An account with this email already exists. Sign in instead.";
  }
  if (status === 429) {
    return message.includes("too many sign-in attempts")
      ? "Too many sign-in attempts. Wait a few seconds, then try again."
      : "Too many requests. Wait a short while, then try again.";
  }
  if (message.includes("too many sign-in attempts")) return "Too many sign-in attempts. Wait a few seconds, then try again.";
  if (kind === "login" && (status === 401 || code.includes("INVALID_EMAIL_OR_PASSWORD") || message.includes("invalid email or password"))) {
    return "Email or password is incorrect.";
  }
  if (kind === "google" && (message.includes("not enabled") || message.includes("not configured") || code.includes("PROVIDER_NOT_FOUND"))) {
    return "Google sign-in is not configured yet. Sign in with email and password instead.";
  }
  if (message.includes("origin") || message.includes("trusted")) return "This site is not authorized for sign-in. Please contact the site administrator.";
  if (status && status >= 500 || /failed to fetch|network error|networkerror|load failed|bad gateway|service unavailable|temporarily unavailable|unexpected token|doctype/i.test(message)) {
    return "SalonBook is waking up or temporarily unavailable. Wait a moment, then try again.";
  }
  if (kind === "google") return "Google sign-in was cancelled or could not be completed. Try again or use email and password.";
  return kind === "register" ? "We could not create the account. Check your details and try again." : "We could not sign you in. Check your details and try again.";
}
