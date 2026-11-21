# SalonBook Client

SalonBook is a responsive salon appointment booking platform. Customers browse services, request appointments, pay for confirmed bookings, and manage their accounts. Salon administrators manage services, appointments, customers, and payment records.

## Live demo

- Client: https://salon-book-client-8wvq.vercel.app
- API health: https://salonbook-server.onrender.com/api/health

A free Render API instance may take a short time to wake after inactivity.

## Features

### Customers
- Browse, search, filter, sort, and paginate active services.
- Sign in to view protected service details and request an appointment.
- Track appointment status and cancel eligible pending requests.
- Pay for confirmed appointments through Stripe Checkout.
- View payment history and receipts.
- Update profile details and profile photo.

### Administrators
- Review dashboard metrics, recent appointments, and transactions.
- Create, update, preview, activate/deactivate, and delete services.
- Confirm, cancel, and complete appointments.
- Search customers and block or unblock accounts.
- Search, filter, and inspect transactions.

### Shared experience
- Black and green branding, responsive navigation and dashboards, accessible focus states, reduced-motion support, and loading, empty, and error states.
- Public registration creates customer accounts only. Admin access is provisioned from the server repository.

## Technologies

Next.js App Router 15, React 19, TypeScript, Tailwind CSS v4, Better Auth, React Hook Form, Zod, Lucide React, Express REST API, and Stripe hosted checkout.

## Routes and frontend structure

Each route has its own page component under src/app. Route groups organize shared shells and access areas.

- (public): home, service list/details, about, contact, privacy, terms
- (auth): sign-in, sign-up, compatibility login/register routes, OAuth callback
- (customer): appointments, dashboard, profile, payment history, receipts
- (admin): overview, services, appointments, customers, transactions, profile
- src/components: shared layouts, providers, UI primitives
- src/features: home, services, appointments, admin, auth
- src/lib: API URLs, auth client, formatting, shared utilities
- src/types: API and domain types

## Screenshots

Add current application screenshots under docs/screenshots/ and link them here when available.

## Requirements and installation

Requirements: Node.js 20 or later, npm, and the SalonBook Express API.

Clone the repository and install dependencies:

    git clone https://github.com/omorfaruk22/Salon-book-client.git
    cd Salon-book-client
    npm install

Copy .env.example to .env.local, fill in the local API values, then run:

    npm run dev

Open http://localhost:3000.

## Environment configuration

Set these values in .env.local for local development:

| Variable | Required | Example / purpose |
| --- | --- | --- |
| NEXT_PUBLIC_API_URL | Yes | /api; browser API base path |
| NEXT_PUBLIC_APP_URL | Yes | http://localhost:3000; frontend origin |
| SALONBOOK_API_ORIGIN | Yes | http://localhost:4000; Express origin without /api |
| NEXT_PUBLIC_CONTACT_EMAIL | No | Public business email |
| NEXT_PUBLIC_CONTACT_PHONE | No | Public business phone |
| NEXT_PUBLIC_SALON_LOCATION | No | Public salon location |
| NEXT_PUBLIC_SALON_OPENING_HOURS | No | Public opening-hours text, e.g. `8:00 AM-10:00 PM` |
| NEXT_PUBLIC_FACEBOOK_URL | No | Official Facebook URL |
| NEXT_PUBLIC_INSTAGRAM_URL | No | Official Instagram URL |
| NEXT_PUBLIC_YOUTUBE_URL | No | Official YouTube URL |

For production, set NEXT_PUBLIC_API_URL to /api, NEXT_PUBLIC_APP_URL to the exact client origin, and SALONBOOK_API_ORIGIN to the API origin. Rebuild/redeploy after changing NEXT_PUBLIC_* values. Never put MongoDB credentials, Better Auth secrets, Stripe secrets, or other private keys in this repository or in a NEXT_PUBLIC_* variable.

## API connection

The app uses the same-origin /api path. Next.js rewrites /api/* requests to SALONBOOK_API_ORIGIN, including Better Auth requests, so the session cookie remains first-party on the client domain. The API must allow the exact frontend origin through CLIENT_ORIGIN.

For local development, run the server at http://localhost:4000. The client uses Better Auth's HttpOnly session cookie and short-lived API JWTs for protected REST requests. See the server README for API and authentication configuration.

## Development commands

    npm run dev        Start the Next.js development server
    npm run lint       Run ESLint
    npm run typecheck  Run the TypeScript check
    npm run build      Build the production app
    npm start          Start the production build locally

On Windows, the build script uses a separate .next-windows output directory to avoid a conflict with an already running dev server.

## Authentication

Email registration and sign-in use Better Auth through /api/auth. Google OAuth is supported and is enabled only after both Google credentials are configured in the API host environment.

To enable Google sign-in for production:

1. In Google Cloud Console, create an OAuth client with application type **Web application**.
2. Add `https://salon-book-client-8wvq.vercel.app` as an authorized JavaScript origin.
3. Add `https://salon-book-client-8wvq.vercel.app/api/auth/callback/google` as an authorized redirect URI. For local testing, also add origin `http://localhost:3000` and redirect URI `http://localhost:3000/api/auth/callback/google`.
4. In the Render dashboard, open the `salonbook-server` web service → **Environment** and add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` using the values from Google Cloud. Keep the secret only on Render; never add it to Vercel, `.env` in Git, or chat.
5. Save the Render environment changes and wait for the server to redeploy. Then try **Continue with Google** on the deployed sign-in page.

The client proxies `/api/auth` through its own origin, so Google redirects back to the Vercel client URL above. Public registration still creates customer accounts only; Admin role is provisioned on the server.

## Related repository

SalonBook API: https://github.com/omorfaruk22/Salon-book-server
