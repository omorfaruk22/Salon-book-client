import { authClient } from "@/lib/auth-client";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export async function apiFetch(path: string, init: RequestInit = {}) {
  const { data, error } = await authClient.token();
  if (error || !data?.token) throw new Error("Your session has expired. Please sign in again.");

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${data.token}`);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");

  return fetch(`${apiBase}${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    headers,
    credentials: "include",
  });
}
