import { authClient } from "@/lib/auth-client";
import { apiUrl } from "@/lib/api-url";
import { isTransientHttpStatus, retryTransient } from "@/lib/retry-transient";

export async function apiFetch(path: string, init: RequestInit = {}) {
  const request = async () => {
    const { data, error } = await authClient.token();
    if (error) {
      if (error instanceof Error) throw error;
      const authError = error as { message?: unknown; status?: unknown; statusCode?: unknown };
      const statusValue = authError.status ?? authError.statusCode;
      const status = typeof statusValue === "number" ? statusValue : undefined;
      const message = typeof authError.message === "string"
        ? authError.message
        : status === 401 ? "Your session has expired. Please sign in again." : "Could not verify your session.";
      throw Object.assign(new Error(message), status ? { status } : {});
    }
    if (!data?.token) throw Object.assign(new Error("Your session has expired. Please sign in again."), { status: 401 });

    const headers = new Headers(init.headers);
    headers.set("Authorization", `Bearer ${data.token}`);
    if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");

    return fetch(apiUrl(path), {
      ...init,
      headers,
      credentials: "include",
    });
  };

  const method = (init.method ?? "GET").toUpperCase();
  if (method !== "GET" && method !== "HEAD") return request();

  return retryTransient(request, (response) => isTransientHttpStatus(response.status), init.signal ?? undefined);
}
