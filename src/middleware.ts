import { NextRequest, NextResponse } from "next/server";

const VERCEL_CLIENT_IP_HEADER = "x-vercel-forwarded-for";
const TRUSTED_CLIENT_IP_HEADER = "x-salonbook-client-ip";

export function middleware(request: NextRequest) {
  const forwardedClientIp = request.headers
    .get(VERCEL_CLIENT_IP_HEADER)
    ?.split(",", 1)[0]
    ?.trim();

  // Never accept the custom header from the browser. Copy Vercel's platform
  // client-IP header into the single header trusted by the Render API.
  const headers = new Headers(request.headers);
  headers.delete(TRUSTED_CLIENT_IP_HEADER);
  if (forwardedClientIp) headers.set(TRUSTED_CLIENT_IP_HEADER, forwardedClientIp);

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/api/auth/:path*"],
};
