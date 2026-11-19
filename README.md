# SalonBook Client

SalonBook's frontend uses Next.js App Router, TypeScript, Tailwind CSS v4, Lucide icons, and a small shared UI layer. Every route has its own `page.tsx`; route groups keep public, auth, customer, and admin pages organized. Shared UI and layout live in `src/components`, domain-specific UI lives in `src/features`, helpers in `src/lib`, and frontend types in `src/types`.

Copy `.env.example` to `.env.local`, then install dependencies and run `npm run dev`. The example values target the local Express API at `http://localhost:4000`.

## API environment variables

| Variable | Purpose | Example |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Browser API base URL, including `/api` | `https://<api-host>/api` |
| `NEXT_PUBLIC_APP_URL` | Public URL of this frontend, without a trailing slash | `https://<client-host>` |
| `SALONBOOK_API_ORIGIN` | Server-side API origin used by service detail rendering and `/api` rewrites; do not add `/api` | `https://<api-host>` |

Set the first two variables on the frontend deployment and `CLIENT_ORIGIN` on the Express service to the exact same frontend origin. Set `SALONBOOK_API_ORIGIN` on the frontend to the Express service origin. The `NEXT_PUBLIC_*` values are embedded during the frontend build, so redeploy after changing them. Never put backend secret values in `NEXT_PUBLIC_*` variables.

When using the built-in same-origin `/api` rewrite, `NEXT_PUBLIC_API_URL` can be `/api`; `SALONBOOK_API_ORIGIN` must still point to the Express service. For a direct browser-to-API connection, use the full API origin plus `/api` and configure the API CORS/trusted origin for the frontend domain.

## Deploying the frontend

The included `render.yaml` describes a Render web service. Vercel can also deploy this Next.js app from the client repository root. On either host, configure the environment variables above before the production build. `SALONBOOK_API_ORIGIN` must be the backend's origin (for example, `https://salonbook-server.onrender.com`), while the public browser URL may include `/api`.
