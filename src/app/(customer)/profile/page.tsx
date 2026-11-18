import { ProfileForm } from "@/features/auth/components/profile-form";
export default function ProfilePage() { return <main className="mx-auto max-w-5xl p-6 md:p-8"><p className="text-sm font-semibold uppercase tracking-[.2em] text-[var(--green-light)]">Account settings</p><h1 className="mt-3 text-3xl font-semibold">Your profile</h1><p className="mt-2 text-[var(--muted)]">Keep your contact details up to date.</p><ProfileForm /></main>; }

