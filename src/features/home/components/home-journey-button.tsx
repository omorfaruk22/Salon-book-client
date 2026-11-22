"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";

export function HomeJourneyButton({ variant = "secondary", className = "" }: { variant?: "primary" | "secondary"; className?: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <Button asChild variant={variant} className={className}>
    <Link href="/services">Explore Services<ArrowRight className="size-4" aria-hidden="true" /></Link>
  </Button>;

  const destination = user?.role === "admin"
    ? { href: "/admin", label: "Open Admin Dashboard" }
    : user
      ? { href: "/services", label: "Book an Appointment" }
      : { href: "/login?next=%2Fservices", label: "Book an Appointment" };

  return <Button asChild variant={variant} className={className}>
    <Link href={destination.href}>{destination.label}<ArrowRight className="size-4" aria-hidden="true" /></Link>
  </Button>;
}
