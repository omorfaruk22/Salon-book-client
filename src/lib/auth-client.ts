import { jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// Keep browser auth requests on the frontend origin. The frontend /api rewrite
// proxies them to the API, so Better Auth session cookies stay first-party.
const authBaseURL = typeof window === "undefined" ? undefined : window.location.origin;

export const authClient = createAuthClient({
  ...(authBaseURL ? { baseURL: authBaseURL } : {}),
  plugins: [jwtClient()],
});
