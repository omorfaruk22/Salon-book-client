"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { Camera, UserRound } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/providers/toast-provider";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApiEnvelope } from "@/types/service";
import type { SalonUser } from "@/types/appointment";

export function ProfileForm() {
  const toast = useToast();
  const { refreshProfile } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<SalonUser | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiFetch("/users/me", { cache: "no-store" });
      const result = await response.json().catch(() => null) as ApiEnvelope<SalonUser> | null;
      if (!response.ok || !result?.data) throw new Error(result?.error?.message ?? "Could not load your profile.");
      setProfile(result.data);
      setName(result.data.name);
      setPhone(result.data.phone ?? "");
      setImageUrl(result.data.imageUrl ?? "");
      setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load your profile."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { toast("Choose a JPEG, PNG, or WebP image.", "error"); return; }
    if (file.size > 5 * 1024 * 1024) { toast("Choose an image smaller than 5 MB.", "error"); return; }

    setUploading(true);
    try {
      const image = await fileToBase64(file);
      const response = await apiFetch("/uploads/image", { method: "POST", body: JSON.stringify({ image, mimeType: file.type, name: file.name }) });
      const result = await response.json().catch(() => null) as ApiEnvelope<{ url: string }> | null;
      if (!response.ok || !result?.data?.url) throw new Error(result?.error?.message ?? "Could not upload your profile photo.");
      setImageUrl(result.data.url);
      toast("Photo uploaded. Save your profile to apply it.", "success");
    } catch (cause) { toast(cause instanceof Error ? cause.message : "Could not upload your profile photo.", "error"); }
    finally { setUploading(false); }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    try {
      const response = await apiFetch("/users/me", { method: "PATCH", body: JSON.stringify({ name, phone, imageUrl }) });
      const result = await response.json().catch(() => null) as ApiEnvelope<SalonUser> | null;
      if (!response.ok || !result?.data) throw new Error(result?.error?.message ?? "Could not update your profile.");
      setProfile(result.data);
      setName(result.data.name);
      setPhone(result.data.phone ?? "");
      setImageUrl(result.data.imageUrl ?? "");
      setError("");
      const refreshed = await refreshProfile(undefined, true);
      if (refreshed.error) toast("Profile saved. Refresh the page if the header still shows the old details.", "info");
      else toast("Profile updated successfully.", "success");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not update your profile.";
      setError(message);
      toast(message, "error");
    } finally { setSaving(false); }
  }

  if (loading) return <div className="mt-7 max-w-3xl space-y-4"><Skeleton className="h-36 rounded-2xl" /><Skeleton className="h-72 rounded-2xl" /></div>;
  if (!profile) return <div className="mt-7 max-w-3xl space-y-3"><ErrorState title="Profile unavailable" description={error || "We could not load your account details."} onRetry={() => void load()} />{error.toLowerCase().includes("session") && <Link href={`/sign-in?next=${encodeURIComponent("/dashboard/profile")}`} className="inline-flex min-h-10 items-center text-sm text-[var(--green-light)] underline">Sign in again</Link>}</div>;

  return <form onSubmit={(event) => void save(event)} className="mt-7 max-w-3xl space-y-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-8">
    <section className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:p-5">
      <span className="grid size-20 shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--border)] bg-[var(--primary)]/15 text-2xl font-bold text-[var(--green-light)]">{imageUrl ? <Image src={imageUrl} alt="Profile photo preview" width={80} height={80} unoptimized className="size-full object-cover" /> : <UserRound className="size-8" aria-hidden="true" />}</span>
      <div className="min-w-0 flex-1"><p className="font-semibold">Profile photo</p><p className="mt-1 text-sm leading-5 text-[var(--muted)]">Upload a JPEG, PNG, or WebP up to 5 MB, or paste a secure image URL below.</p><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => fileInput.current?.click()} disabled={uploading} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-4 text-sm font-medium text-[var(--green-light)] transition hover:border-[var(--green-light)]/60 disabled:opacity-60"><Camera className="size-4" aria-hidden="true" />{uploading ? "Uploading…" : "Upload photo"}</button>{imageUrl && <button type="button" onClick={() => setImageUrl("")} className="min-h-10 rounded-xl px-3 text-sm text-[var(--muted)] underline underline-offset-4 hover:text-white">Remove photo</button>}<input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void uploadImage(event)} className="sr-only" /></div></div>
    </section>

    <label className="block space-y-2 text-sm font-medium"><span>Profile image URL</span><input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} maxLength={2048} placeholder="https://example.com/photo.jpg" className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--green-light)] focus:ring-2 focus:ring-[var(--green-light)]/25" /><span className="block text-xs font-normal text-[var(--muted)]">Use an HTTPS link. Your photo appears after you save.</span></label>

    <div className="grid gap-5 sm:grid-cols-2">
      <label className="block space-y-2 text-sm font-medium"><span>Full name</span><input value={name} onChange={(event) => setName(event.target.value)} minLength={2} maxLength={100} required className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 outline-none transition focus:border-[var(--green-light)] focus:ring-2 focus:ring-[var(--green-light)]/25" /></label>
      <label className="block space-y-2 text-sm font-medium"><span>Phone number <span className="font-normal text-[var(--muted)]">(optional)</span></span><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} maxLength={20} placeholder="+880 1XXX-XXXXXX" className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 outline-none transition focus:border-[var(--green-light)] focus:ring-2 focus:ring-[var(--green-light)]/25" /></label>
    </div>

    <div className="grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-2"><div><p className="text-xs uppercase tracking-wider text-[var(--muted)]">Email address</p><p className="mt-1 break-all text-sm font-medium">{profile.email}</p><p className="mt-1 text-xs text-[var(--muted)]">Email changes are not available from this profile form.</p></div><div><p className="text-xs uppercase tracking-wider text-[var(--muted)]">Account created</p><p className="mt-1 text-sm font-medium">{new Intl.DateTimeFormat("en-BD", { dateStyle: "medium" }).format(new Date(profile.createdAt))}</p></div></div>

    {error && <p role="alert" className="rounded-xl border border-red-900/70 bg-red-950/35 p-3 text-sm text-red-200">{error}</p>}
    <button type="submit" disabled={saving || uploading} className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[var(--primary)] px-5 font-semibold text-white transition hover:bg-[var(--primary-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">{saving ? "Saving profile…" : "Save profile"}</button>
  </form>;
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      const base64 = dataUrl.split(",")[1];
      if (!base64) reject(new Error("The selected image could not be encoded."));
      else resolve(base64);
    };
    reader.readAsDataURL(file);
  });
}
