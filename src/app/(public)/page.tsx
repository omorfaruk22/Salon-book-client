import type { Metadata } from "next";
import { FeaturedServicesSection } from "@/features/home/components/featured-services-section";
import { HeroSection } from "@/features/home/components/hero-section";
import { HomeCtaSection } from "@/features/home/components/home-cta-section";
import { HowItWorksSection } from "@/features/home/components/how-it-works-section";
import { WhySalonBookSection } from "@/features/home/components/why-salonbook-section";
import { SALON_HERO_IMAGE_ALT, SALON_HERO_IMAGE_URL } from "@/features/home/constants";

export const metadata: Metadata = {
  title: { absolute: "SalonBook – Premium Salon Appointment Booking" },
  description: "Book trusted salon professionals, explore premium beauty services, and enjoy a personalized experience designed around you.",
  openGraph: {
    title: "SalonBook – Premium Salon Appointment Booking",
    description: "Explore salon services, request your preferred appointment time, and manage your visit with SalonBook.",
    type: "website",
    images: [{ url: SALON_HERO_IMAGE_URL, width: 1800, height: 1200, alt: SALON_HERO_IMAGE_ALT }],
  },
};

export default function HomePage() {
  return <main>
    <HeroSection />
    <FeaturedServicesSection />
    <WhySalonBookSection />
    <HowItWorksSection />
    <HomeCtaSection />
  </main>;
}
