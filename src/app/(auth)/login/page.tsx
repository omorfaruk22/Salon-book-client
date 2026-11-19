import { AuthForm } from "@/features/auth/components/auth-form";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

export default function LoginPage() { return <main className="py-12 sm:py-20"><Container className="max-w-5xl"><section className="mx-auto max-w-lg rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] p-6 shadow-[0_24px_90px_rgb(0_0_0_/_25%)] sm:p-9"><SectionHeading eyebrow="SalonBook" title="Welcome back" description="Sign in to manage your salon bookings." /><AuthForm mode="login" /></section></Container></main>; }

