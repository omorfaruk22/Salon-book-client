# SalonBook Client

SalonBook's frontend uses Next.js App Router, TypeScript, Tailwind CSS v4, Lucide icons, and a small shared UI layer. Every route has its own `page.tsx`; route groups keep public, auth, customer, and admin pages organized. Shared UI and layout live in `src/components`, domain-specific UI lives in `src/features`, helpers in `src/lib`, and frontend types in `src/types`.

Copy `.env.example` to `.env.local`, then install dependencies and run `npm run dev`. The example sends browser requests through the same-origin `/api` rewrite to the local Express API at `http://localhost:4000`.

## API environment variables

| Variable | Purpose | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Browser API base URL, including `/api` | `/api` |
| `NEXT_PUBLIC_APP_URL` | Public URL of this frontend, without a trailing slash | `https://<client-host>` |
| `SALONBOOK_API_ORIGIN` | Server-side API origin used by service detail rendering and `/api` rewrites; do not add `/api` | `https://<api-host>` |

Set `NEXT_PUBLIC_API_URL=/api` on the frontend deployment and set `CLIENT_ORIGIN` on the Express service to the exact same frontend origin. Set `SALONBOOK_API_ORIGIN` on the frontend to the Express service origin. The Next.js same-origin rewrite forwards `/api/*` to Express, so Better Auth's session cookie remains first-party in the browser. The `NEXT_PUBLIC_*` values are embedded during the frontend build, so redeploy after changing them. Never put backend secret values in `NEXT_PUBLIC_*` variables.

Better Auth client requests and its `useSession` hook use the same-origin API rewrite and keep session state in Better Auth's HttpOnly cookie. REST requests obtain 15-minute API JWTs through the Better Auth JWT plugin; the client does not write tokens to localStorage. Express validates these tokens with EdDSA, JWKS, expiration, issuer, and audience.

The public and authentication route groups share the marketing header and footer. Customer and Admin route groups stay outside that shell so the public navigation does not appear in dashboards. About, Contact, Privacy, and Terms routes are present; legal pages are explicit placeholders until approved text is available. `NEXT_PUBLIC_CONTACT_EMAIL`, `NEXT_PUBLIC_CONTACT_PHONE`, `NEXT_PUBLIC_SALON_LOCATION`, and the `NEXT_PUBLIC_*_URL` social variables are optional public display configuration. Leave them empty until the real business details and official social accounts are confirmed.

The auth pages are available at `/sign-in` and `/sign-up` (the existing `/login` and `/register` paths remain compatible). Public registration creates customers only. Admin accounts are provisioned from the API repository with its `admin:promote` script; no Admin role field is exposed in the client.

Google OAuth is configured only on the API. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` there and add `<client origin>/api/auth/callback/google` as an Authorized redirect URI in Google Cloud Console. Google sign-in has not been live-verified unless those provider credentials are configured.

When using the built-in same-origin `/api` rewrite, `NEXT_PUBLIC_API_URL` can be `/api`; `SALONBOOK_API_ORIGIN` must still point to the Express service. For a direct browser-to-API connection, use the full API origin plus `/api` and configure the API CORS/trusted origin for the frontend domain.

## Deploying the frontend

The included `render.yaml` describes a Render web service. Vercel can also deploy this Next.js app from the client repository root. On either host, configure the environment variables above before the production build. `SALONBOOK_API_ORIGIN` must be the backend's origin (for example, `https://salonbook-server.onrender.com`), while the public browser URL may include `/api`.
