# SalonBook Client

Next.js App Router + TypeScript + Tailwind CSS frontend. Every route has its own `page.tsx`; route groups keep public, auth, customer, and admin pages organized. Shared UI lives in `src/components`, domain UI in `src/features`, helpers in `src/lib`, and frontend types in `src/types`.

Copy `.env.example` to `.env.local`, then install dependencies and run `npm run dev`.

## Production deployment (Render)

The root `render.yaml` defines the Next.js web service. Set `NEXT_PUBLIC_API_URL` to the deployed API origin plus `/api` (for example, `https://<api-host>/api`) and `NEXT_PUBLIC_APP_URL` to this client service's public `https://` origin. These public variables are embedded during the build, so redeploy after changing them. The API's `CLIENT_ORIGIN` must match this client origin exactly.
