const configuredOrigin = process.env.SALONBOOK_API_ORIGIN?.trim() || "http://localhost:4000";
const apiOrigin = configuredOrigin.replace(/\/+$/, "").replace(/\/api$/i, "");

export function serverApiUrl(path: string) {
  return `${apiOrigin}/api/${path.replace(/^\/+/, "")}`;
}
