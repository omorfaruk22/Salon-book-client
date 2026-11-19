import type { Metadata } from "next";
import type { Viewport } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { ToastProvider } from "@/components/providers/toast-provider";
import { AuthProvider } from "@/components/providers/auth-provider";

export const metadata: Metadata = {
  title: { default: "SalonBook | Salon appointments, made simple", template: "%s | SalonBook" },
  description: "Discover salon services, request an appointment, and manage your bookings with SalonBook.",
  applicationName: "SalonBook",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#080B0A",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <AuthProvider>
            <SiteHeader />
            {children}
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}

