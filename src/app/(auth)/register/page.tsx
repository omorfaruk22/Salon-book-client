import { AuthForm } from "@/features/auth/components/auth-form";
export default function RegisterPage() { return <main className="mx-auto max-w-md px-6 py-16"><p className="text-sm font-semibold uppercase tracking-[.2em] text-[var(--green-light)]">SalonBook</p><h1 className="mt-3 text-3xl font-semibold">Create your account</h1><p className="mt-2 text-[var(--muted)]">Join SalonBook to request appointments.</p><AuthForm mode="register" /></main>; }

