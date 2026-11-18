"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import type { ApiEnvelope } from "@/types/service";
import type { SalonUser } from "@/types/appointment";

export function ProfileForm() {
  const [profile, setProfile] = useState<SalonUser | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiFetch("/users/me");
      const result = (await response.json()) as ApiEnvelope<SalonUser>;
      if (!response.ok) throw new Error(result.error?.message ?? "Could not load profile.");
      setProfile(result.data); setName(result.data.name); setPhone(result.data.phone ?? ""); setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load profile."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); }, [load]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(""); setNotice("");
    try {
      const response = await apiFetch("/users/me", { method: "PATCH", body: JSON.stringify({ name, phone }) });
      const result = (await response.json()) as ApiEnvelope<SalonUser>;
      if (!response.ok) throw new Error(result.error?.message ?? "Could not update profile.");
      setProfile(result.data); setName(result.data.name); setPhone(result.data.phone ?? ""); setNotice("Profile updated.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update profile."); }
    finally { setSaving(false); }
  }

  if (loading) return <p className="py-12 text-center text-[var(--muted)]">Loading profile…</p>;
  return <form onSubmit={save} className="mt-8 max-w-2xl space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
    {profile && <div className="rounded-xl bg-[var(--surface)] p-4"><p className="text-xs uppercase tracking-wider text-[var(--muted)]">Email address</p><p className="mt-1 font-medium">{profile.email}</p><p className="mt-2 text-xs text-[var(--muted)]">Contact the salon administrator if you need to change your email.</p></div>}
    <label className="block space-y-2 text-sm font-medium"><span>Full name</span><input value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={100} required className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 outline-none focus:border-[var(--green-light)]" /></label>
    <label className="block space-y-2 text-sm font-medium"><span>Phone number <span className="text-[var(--muted)]">(optional)</span></span><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+880 1XXX-XXXXXX" className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 outline-none focus:border-[var(--green-light)]" /></label>
    {error && <p role="alert" className="rounded-xl border border-red-900 bg-red-950/40 p-3 text-sm text-red-200">{error}</p>}{notice && <p role="status" className="rounded-xl border border-[var(--primary)]/40 bg-[var(--primary)]/10 p-3 text-sm text-[var(--green-soft)]">{notice}</p>}
    <button disabled={saving} className="rounded-xl bg-[var(--primary)] px-5 py-3 font-semibold hover:bg-[var(--primary-hover)] disabled:opacity-60">{saving ? "Saving…" : "Save profile"}</button>
  </form>;
}
