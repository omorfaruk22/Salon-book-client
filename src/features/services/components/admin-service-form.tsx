"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowLeft, ImagePlus, LoaderCircle, Scissors, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/providers/toast-provider";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api-client";
import type { ApiEnvelope, SalonService } from "@/types/service";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const CATEGORIES = [
  ["hair", "Haircut"], ["hair styling", "Hair Styling"], ["hair color", "Hair Color"],
  ["hair coloring", "Hair Coloring"], ["facial", "Facial"], ["skin care", "Skin Care"],
  ["grooming", "Grooming"], ["manicure", "Manicure"], ["pedicure", "Pedicure"],
  ["nails", "Nails"], ["makeup", "Makeup"], ["spa", "Spa"], ["massage", "Massage"], ["other", "Other"],
];
type FormState = { name: string; category: string; description: string; price: string; durationMinutes: string; isActive: boolean };
const initialForm: FormState = { name: "", category: "", description: "", price: "", durationMinutes: "30", isActive: true };

export function AdminServiceForm({ serviceId }: { serviceId?: string }) {
  const editing = Boolean(serviceId);
  const router = useRouter();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [service, setService] = useState<SalonService | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(editing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => {
    if (!serviceId) return;
    if (!/^[a-f\d]{24}$/i.test(serviceId)) {
      setError("This service link has an invalid ID.");
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      try {
        const response = await apiFetch("/services/admin/" + serviceId, { cache: "no-store", signal: controller.signal });
        const result = await response.json().catch(() => null) as ApiEnvelope<SalonService> | null;
        if (!response.ok || !result?.data) throw new Error(result?.error?.message ?? "Service not found.");
        setService(result.data);
        setForm({
          name: result.data.name,
          category: result.data.category,
          description: result.data.description,
          price: String(result.data.price),
          durationMinutes: String(result.data.durationMinutes),
          isActive: result.data.isActive,
        });
        setError("");
      } catch (cause) {
        if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : "Could not load this service.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [serviceId]);

  function chooseFile(selected: File | undefined) {
    if (!selected) return;
    if (!IMAGE_TYPES.includes(selected.type)) {
      toast("Choose a JPEG, PNG, or WebP image.", "error");
      return;
    }
    if (!selected.size || selected.size > MAX_IMAGE_SIZE) {
      toast("Choose an image smaller than 5 MB.", "error");
      return;
    }
    setFile(selected);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!editing && !file) {
      const message = "Choose a service image before creating the service.";
      setError(message);
      toast(message, "error");
      return;
    }
    if (!form.category) {
      const message = "Select a service category.";
      setError(message);
      toast(message, "error");
      return;
    }
    if (!Number.isFinite(Number(form.price)) || Number(form.price) <= 0) {
      const message = "Price must be greater than 0 BDT.";
      setError(message);
      toast(message, "error");
      return;
    }
    if (!Number.isInteger(Number(form.durationMinutes)) || Number(form.durationMinutes) < 5 || Number(form.durationMinutes) > 600) {
      const message = "Duration must be between 5 and 600 minutes.";
      setError(message);
      toast(message, "error");
      return;
    }

    setSaving(true);
    try {
      let imageUrl: string | undefined;
      if (file) {
        const body = new FormData();
        body.append("image", file);
        const uploadResponse = await apiFetch("/uploads/image", { method: "POST", body });
        const uploadResult = await uploadResponse.json().catch(() => null) as ApiEnvelope<{ url: string }> | null;
        if (!uploadResponse.ok || !uploadResult?.data?.url) throw new Error(uploadResult?.error?.message ?? "Image upload failed. Check ImgBB server configuration.");
        imageUrl = uploadResult.data.url;
      }
      const payload = {
        name: form.name.trim(),
        category: form.category,
        description: form.description.trim(),
        price: Number(form.price),
        durationMinutes: Number(form.durationMinutes),
        isActive: form.isActive,
        ...(imageUrl ? { imageUrl } : {}),
      };
      const response = await apiFetch(editing ? "/services/" + serviceId : "/services", {
        method: editing ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => null) as ApiEnvelope<SalonService> | null;
      if (!response.ok || !result?.data) throw new Error(result?.error?.message ?? "Could not save this service.");
      toast(editing ? "Service updated successfully." : "Service created successfully.", "success");
      router.replace("/admin/services");
      router.refresh();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not save this service.";
      setError(message);
      toast(message, "error");
    } finally { setSaving(false); }
  }

  if (loading) return <div className="mt-8 max-w-4xl space-y-4"><Skeleton className="h-16 rounded-2xl" /><Skeleton className="h-[32rem] rounded-3xl" /></div>;
  if (editing && (!service || error)) return <div className="mt-8 max-w-3xl space-y-4"><ErrorState title={!/^[a-f\d]{24}$/i.test(serviceId ?? "") ? "Invalid service ID" : "Service unavailable"} description={error || "This service could not be found."} /><Button asChild variant="secondary"><Link href="/admin/services"><ArrowLeft className="size-4" />Back to services</Link></Button></div>;

  const imageSource = preview || service?.imageUrl || "";
  return <div className="mt-8 max-w-4xl">
    <form onSubmit={(event) => void save(event)} className="space-y-6 rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 sm:p-8">
      <section>
        <p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--green-light)]">Service information</p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">Add clear details so customers can choose the right appointment.</p>
      </section>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block space-y-2 text-sm font-medium sm:col-span-2"><span>Service name</span><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} minLength={2} maxLength={100} placeholder="e.g. Signature Haircut" required /></label>
        <label className="block space-y-2 text-sm font-medium"><span>Category</span><Select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} required><option value="" disabled>Select a category</option>{CATEGORIES.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</Select></label>
        <label className="block space-y-2 text-sm font-medium"><span>Price (BDT)</span><Input type="number" inputMode="decimal" min="0.01" max="1000000" step="0.01" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="500" required /></label>
        <label className="block space-y-2 text-sm font-medium"><span>Duration (minutes)</span><Input type="number" min="5" max="600" step="5" value={form.durationMinutes} onChange={(event) => setForm({ ...form, durationMinutes: event.target.value })} required /></label>
        <label className="block space-y-2 text-sm font-medium"><span>Service status</span><Select value={form.isActive ? "active" : "inactive"} onChange={(event) => setForm({ ...form, isActive: event.target.value === "active" })}><option value="active">Active — visible and bookable</option><option value="inactive">Inactive — hidden from customers</option></Select></label>
      </div>

      <label className="block space-y-2 text-sm font-medium"><span>Description</span><Textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} minLength={10} maxLength={2000} rows={5} placeholder="Describe what the customer can expect from this service..." required /><span className="text-xs font-normal text-[var(--muted)]">{form.description.length}/2000 characters</span></label>

      <section className="space-y-3">
        <div><h2 className="text-sm font-medium">Service image</h2><p className="mt-1 text-xs leading-5 text-[var(--muted)]">JPEG, PNG, or WebP · maximum 5 MB · securely hosted by ImgBB.</p></div>
        {imageSource ? <div className="relative h-56 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] sm:h-72"><Image src={imageSource} alt={file ? "New service image preview" : "Current service image"} fill unoptimized sizes="(max-width: 640px) 100vw, 768px" className="object-cover" /><span className="absolute bottom-3 left-3 rounded-full border border-white/10 bg-black/70 px-3 py-1.5 text-xs text-white">{file ? file.name : "Current service image"}</span></div>
          : <div className="grid h-40 place-items-center rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] text-[var(--muted)]"><div className="text-center"><Scissors className="mx-auto size-7 text-[var(--green-light)]" /><p className="mt-2 text-sm">Choose an image to preview it here</p></div></div>}
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseFile(event.target.files?.[0])} className="sr-only" aria-label="Choose service image" />
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}><ImagePlus className="size-4" />{file ? "Choose another image" : editing ? "Replace image" : "Choose image"}</Button>
          {file && <button type="button" className="text-sm text-[var(--muted)] underline underline-offset-4 hover:text-white" onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = ""; }}>Remove selection</button>}
          {editing && !file && <span className="text-xs text-[var(--muted)]">Leave unchanged to keep the current image.</span>}
        </div>
      </section>

      {error && <p role="alert" className="rounded-xl border border-red-900/70 bg-red-950/35 p-4 text-sm text-red-200">{error}</p>}
      <div className="flex flex-col-reverse gap-3 border-t border-[var(--border)] pt-5 sm:flex-row sm:justify-between">
        <Button asChild variant="secondary"><Link href="/admin/services"><ArrowLeft className="size-4" />Cancel</Link></Button>
        <Button type="submit" disabled={saving}>{saving ? <><LoaderCircle className="size-4 animate-spin" />{file ? "Uploading and saving…" : "Saving…"}</> : <><UploadCloud className="size-4" />{editing ? "Save changes" : "Create Service"}</>}</Button>
      </div>
    </form>
  </div>;
}
