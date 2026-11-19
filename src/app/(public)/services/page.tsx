import type { Metadata } from "next";
import { Suspense } from "react";
import { ServiceBrowser, ServiceBrowserFallback } from "@/features/services/components/service-browser";

export const metadata: Metadata = {
  title: { absolute: "Browse Salon Services | SalonBook" },
  description: "Explore salon services, compare prices, and find the right beauty and personal care experience with SalonBook.",
};

export default function ServicesPage() {
  return <Suspense fallback={<ServiceBrowserFallback />}><ServiceBrowser /></Suspense>;
}
