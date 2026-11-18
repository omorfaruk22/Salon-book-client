"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api-client";
import type { ApiEnvelope, SalonService } from "@/types/service";

type ServiceFormValues = { name: string; description: string; category: string; durationMinutes: string; price: string; imageUrl: string };
const blankForm: ServiceFormValues = { name: "", description: "", category: "", durationMinutes: "30", price: "", imageUrl: "" };
const currency = new Intl.NumberFormat("en-BD", { style: "currency", currency: "BDT", maximumFractionDigits: 0 });

export function AdminServiceManager() {
  const [services, setServices] = useState<SalonService[]>([]);
  const [form, setForm] = useState<ServiceFormValues>(blankForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiFetch("/services/admin");
      const result = (await response.json()) as ApiEnvelope<SalonService[]>;
      if (!response.ok) throw new Error(result.error?.message ?? "Could not load service list.");
      setServices(result.data);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load service list.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadServices(); }, [loadServices]);

  function resetForm() { setEditingId(null); setForm(blankForm); }
  function editService(service: SalonService) {
    setEditingId(service._id);
    setForm({ name: service.name, description: service.description, category: service.category, durationMinutes: String(service.durationMinutes), price: String(service.price), imageUrl: service.imageUrl ?? "" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError(""); setNotice("");
    try {
      const response = await apiFetch(editingId ? `/services/${editingId}` : "/services", {
        method: editingId ? "PATCH" : "POST",
        body: JSON.stringify({ ...form, durationMinutes: Number(form.durationMinutes), price: Number(form.price), imageUrl: form.imageUrl || undefined }),
      });
      const result = (await response.json()) as ApiEnvelope<SalonService>;
      if (!response.ok) throw new Error(result.error?.message ?? "Could not save service.");
      setNotice(editingId ? "Service updated." : "Service added."); resetForm(); await loadServices();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save service."); }
    finally { setSaving(false); }
  }

  async function toggleService(service: SalonService) {
    setError(""); setNotice("");
    try {
      const response = await apiFetch(`/services/${service._id}/status`, { method: "PATCH", body: JSON.stringify({ isActive: !service.isActive }) });
      const result = (await response.json()) as ApiEnvelope<SalonService>;
      if (!response.ok) throw new Error(result.error?.message ?? "Could not update service status.");
      setNotice(service.isActive ? "Service deactivated." : "Service activated."); await loadServices();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update service status."); }
  }

  async function deleteService(service: SalonService) {
    if (!window.confirm(`Delete “${service.name}” permanently?`)) return;
    setError(""); setNotice("");
    try {
      const response = await apiFetch(`/services/${service._id}`, { method: "DELETE" });
      const result = (await response.json()) as ApiEnvelope<SalonService>;
      if (!response.ok) throw new Error(result.error?.message ?? "Could not delete service.");
      if (editingId === service._id) resetForm();
      setNotice("Service deleted."); await loadServices();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not delete service."); }
  }

  async function uploadImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) { setError("Choose a JPEG, PNG, or WebP image."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image must be smaller than 5 MB."); return; }
    setUploadingImage(true); setError(""); setNotice("");
    try {
      const dataUrl = await readAsDataUrl(file);
      const base64 = dataUrl.split(",", 2)[1];
      const response = await apiFetch("/uploads/image", { method: "POST", body: JSON.stringify({ image: base64, mimeType: file.type, name: file.name }) });
      const result = (await response.json()) as ApiEnvelope<{ url: string }>;
      if (!response.ok) throw new Error(result.error?.message ?? "Could not upload image.");
      setForm((current) => ({ ...current, imageUrl: result.data.url })); setNotice("Image uploaded. Save the service to keep it.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not upload image."); }
    finally { setUploadingImage(false); }
  }

  return <div className="mt-8 space-y-8">
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-6 md:p-8">
      <div><p className="text-sm font-semibold uppercase tracking-[.18em] text-[var(--green-light)]">{editingId ? "Edit service" : "Service details"}</p><h2 className="mt-2 text-2xl font-semibold">{editingId ? "Update the menu" : "Add to the menu"}</h2></div>
      <form onSubmit={saveService} className="mt-6 grid gap-4 md:grid-cols-2">
        <Field label="Service name" value={form.name} onChange={(value) => setForm({ ...form, name: value })} required />
        <Field label="Category" value={form.category} onChange={(value) => setForm({ ...form, category: value })} placeholder="Hair, Nails, Facial…" required />
        <Field label="Price (BDT)" type="number" min="0" step="1" value={form.price} onChange={(value) => setForm({ ...form, price: value })} required />
        <Field label="Duration (minutes)" type="number" min="5" max="600" step="5" value={form.durationMinutes} onChange={(value) => setForm({ ...form, durationMinutes: value })} required />
        <div className="space-y-3"><Field label="Image URL (optional)" type="url" value={form.imageUrl} onChange={(value) => setForm({ ...form, imageUrl: value })} /><label className="inline-flex cursor-pointer items-center rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-medium text-[var(--green-light)] hover:border-[var(--green-light)]"><input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => void uploadImage(event)} disabled={uploadingImage} className="sr-only" />{uploadingImage ? "Uploading image…" : "Choose and upload image"}</label>{form.imageUrl && <img src={form.imageUrl} alt="Service preview" className="h-20 w-20 rounded-xl border border-[var(--border)] object-cover" />}</div>
        <label className="block space-y-2 text-sm font-medium md:col-span-2"><span>Description</span><textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} minLength={10} maxLength={2000} rows={4} required className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 outline-none focus:border-[var(--green-light)]" /></label>
        {error && <p role="alert" className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm text-red-200 md:col-span-2">{error}</p>}
        {notice && <p role="status" className="rounded-xl border border-[var(--primary)]/40 bg-[var(--primary)]/10 px-4 py-3 text-sm text-[var(--green-soft)] md:col-span-2">{notice}</p>}
        <div className="flex gap-3 md:col-span-2"><button disabled={saving} className="rounded-xl bg-[var(--primary)] px-5 py-3 font-semibold hover:bg-[var(--primary-hover)] disabled:opacity-60">{saving ? "Saving…" : editingId ? "Save changes" : "Add service"}</button>{editingId && <button type="button" onClick={resetForm} className="rounded-xl border border-[var(--border)] px-5 py-3">Cancel edit</button>}</div>
      </form>
    </section>
    <section><div className="flex items-end justify-between"><div><p className="text-sm font-semibold uppercase tracking-[.18em] text-[var(--green-light)]">Salon menu</p><h2 className="mt-2 text-2xl font-semibold">All services <span className="text-base font-normal text-[var(--muted)]">({services.length})</span></h2></div><button onClick={() => void loadServices()} className="text-sm text-[var(--green-light)] hover:underline">Refresh</button></div>
      {loading ? <p className="py-10 text-center text-[var(--muted)]">Loading services…</p> : error && !services.length ? <p role="alert" className="mt-5 rounded-xl border border-red-900 bg-red-950/40 p-4 text-red-200">{error}</p> : services.length ? <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--border)]"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-[var(--surface)] text-[var(--muted)]"><tr><th className="px-5 py-4 font-medium">Service</th><th className="px-5 py-4 font-medium">Category</th><th className="px-5 py-4 font-medium">Price</th><th className="px-5 py-4 font-medium">Status</th><th className="px-5 py-4 font-medium">Actions</th></tr></thead><tbody>{services.map((service) => <tr key={service._id} className="border-t border-[var(--border)]"><td className="px-5 py-4"><p className="font-semibold">{service.name}</p><p className="mt-1 text-xs text-[var(--muted)]">{service.durationMinutes} min</p></td><td className="px-5 py-4 capitalize">{service.category}</td><td className="px-5 py-4">{currency.format(service.price)}</td><td className="px-5 py-4"><span className={service.isActive ? "rounded-full bg-[var(--primary)]/15 px-3 py-1 text-xs text-[var(--green-light)]" : "rounded-full bg-slate-700/50 px-3 py-1 text-xs text-[var(--muted)]"}>{service.isActive ? "Active" : "Inactive"}</span></td><td className="px-5 py-4"><div className="flex gap-3"><button onClick={() => editService(service)} className="text-[var(--green-light)] hover:underline">Edit</button><button onClick={() => void toggleService(service)} className="text-[var(--muted)] hover:text-white">{service.isActive ? "Deactivate" : "Activate"}</button><button onClick={() => void deleteService(service)} className="text-red-300 hover:text-red-200">Delete</button></div></td></tr>)}</tbody></table></div> : <p className="mt-5 rounded-2xl border border-dashed border-[var(--border)] p-10 text-center text-[var(--muted)]">No services yet. Add your first service above.</p>}
    </section>
  </div>;
}

function Field(props: { label: string; value: string; onChange: (value: string) => void; type?: string; min?: string; max?: string; step?: string; placeholder?: string; required?: boolean }) {
  return <label className="block space-y-2 text-sm font-medium"><span>{props.label}</span><input type={props.type ?? "text"} min={props.min} max={props.max} step={props.step} placeholder={props.placeholder} value={props.value} onChange={(event) => props.onChange(event.target.value)} required={props.required} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 outline-none focus:border-[var(--green-light)]" /></label>;
}

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read this image."));
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Could not read this image."));
    reader.readAsDataURL(file);
  });
}
