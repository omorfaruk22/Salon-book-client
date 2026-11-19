const configuredApiBase = process.env.NEXT_PUBLIC_API_URL?.trim() || "http://localhost:4000/api";

export const apiBaseUrl = configuredApiBase.replace(/\/+$/, "");

export function apiUrl(path: string) {
  return `${apiBaseUrl}/${path.replace(/^\/+/, "")}`;
}
