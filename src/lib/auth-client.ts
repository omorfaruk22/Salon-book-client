import { jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

const apiBase = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
const authBaseURL = apiBase.startsWith("/") ? undefined : new URL(apiBase).origin;

export const authClient = createAuthClient({
  ...(authBaseURL ? { baseURL: authBaseURL } : {}),
  plugins: [jwtClient()],
});
