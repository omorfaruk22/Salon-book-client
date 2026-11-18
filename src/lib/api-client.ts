const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export async function apiFetch(path: string, init: RequestInit = {}) {
  const tokenResponse = await fetch(`${apiBase}/auth/token`, {
    credentials: "include",
    cache: "no-store",
  });
  const tokenData = (await tokenResponse.json()) as { token?: string; message?: string };
  if (!tokenResponse.ok || !tokenData.token) {
    throw new Error(tokenData.message ?? "Please sign in to continue.");
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${tokenData.token}`);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");

  return fetch(`${apiBase}${path.startsWith("/") ? path : `/${path}`}`, {
    ...init,
    headers,
    credentials: "include",
  });
}
