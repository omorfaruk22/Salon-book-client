"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { apiFetch } from "@/lib/api-client";
import type { ApiEnvelope } from "@/types/service";
import type { SalonUser } from "@/types/appointment";

export function AdminCustomerManager() {
  const [customers, setCustomers] = useState<SalonUser[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: "1", limit: "50" });
      if (search.trim()) params.set("q", search.trim());
      if (status !== "all") params.set("status", status);
      const response = await apiFetch(`/users?${params}`);
      const result = (await response.json()) as ApiEnvelope<SalonUser[]>;
      if (!response.ok) throw new Error(result.error?.message ?? "Could not load customers.");
      setCustomers(result.data); setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not load customers."); }
    finally { setLoading(false); }
  }, [search, status]);
  useEffect(() => { const timeout = window.setTimeout(() => void load(), 180); return () => window.clearTimeout(timeout); }, [load]);

  async function toggle(customer: SalonUser) {
    setError(""); setNotice("");
    try {
      const nextStatus = customer.status === "active" ? "blocked" : "active";
      const response = await apiFetch(`/users/${customer._id}/status`, { method: "PATCH", body: JSON.stringify({ status: nextStatus }) });
      const result = (await response.json()) as ApiEnvelope<SalonUser>;
      if (!response.ok) throw new Error(result.error?.message ?? "Could not update customer status.");
      setNotice(nextStatus === "blocked" ? "Customer blocked." : "Customer unblocked."); await load();
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not update customer status."); }
  }

  return <div className="mt-8">
    <div className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:grid-cols-[1fr_200px]"><label className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--background)] px-4"><Search size={18} className="text-[var(--muted)]" /><span className="sr-only">Search customers</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, phone" className="w-full bg-transparent py-3 text-sm outline-none" /></label><label className="sr-only" htmlFor="customer-status">Filter customers</label><select id="customer-status" value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-sm"><option value="all">All customers</option><option value="active">Active</option><option value="blocked">Blocked</option></select></div>
    {error && <p role="alert" className="mt-4 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-200">{error}</p>}{notice && <p role="status" className="mt-4 rounded-xl border border-[var(--primary)]/40 bg-[var(--primary)]/10 p-4 text-sm text-[var(--green-soft)]">{notice}</p>}
    {loading ? <p className="py-12 text-center text-[var(--muted)]">Loading customers…</p> : customers.length ? <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--border)]"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-[var(--surface)] text-[var(--muted)]"><tr><th className="px-5 py-4 font-medium">Customer</th><th className="px-5 py-4 font-medium">Phone</th><th className="px-5 py-4 font-medium">Joined</th><th className="px-5 py-4 font-medium">Status</th><th className="px-5 py-4 font-medium">Action</th></tr></thead><tbody>{customers.map((customer) => <tr key={customer._id} className="border-t border-[var(--border)]"><td className="px-5 py-4"><p className="font-medium">{customer.name}</p><p className="mt-1 text-xs text-[var(--muted)]">{customer.email}</p></td><td className="px-5 py-4 text-[var(--muted)]">{customer.phone || "—"}</td><td className="px-5 py-4 text-[var(--muted)]">{new Date(customer.createdAt).toLocaleDateString()}</td><td className="px-5 py-4"><span className={customer.status === "active" ? "rounded-full bg-[var(--primary)]/15 px-3 py-1 text-xs text-[var(--green-light)]" : "rounded-full bg-red-950/60 px-3 py-1 text-xs text-red-200"}>{customer.status}</span></td><td className="px-5 py-4"><button onClick={() => void toggle(customer)} className={customer.status === "active" ? "text-red-200 hover:underline" : "text-[var(--green-light)] hover:underline"}>{customer.status === "active" ? "Block" : "Unblock"}</button></td></tr>)}</tbody></table></div> : !error && <p className="mt-5 rounded-2xl border border-dashed border-[var(--border)] p-12 text-center text-[var(--muted)]">No customers found.</p>}
  </div>;
}
