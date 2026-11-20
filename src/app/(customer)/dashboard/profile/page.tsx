import { ProfileForm } from "@/features/auth/components/profile-form";

export default function CustomerProfilePage() {
  return <div className="mx-auto max-w-5xl"><header><p className="text-xs font-semibold uppercase tracking-[.18em] text-[var(--green-light)]">Account settings</p><h1 className="mt-2 text-3xl font-bold tracking-tight">My profile</h1><p className="mt-2 text-[var(--muted)]">Manage the contact information and photo on your account.</p></header><ProfileForm /></div>;
}
