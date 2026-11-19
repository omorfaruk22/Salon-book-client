"use client";

import Link from "next/link";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";

export function HomeJourneyButton({ variant = "secondary", className = "" }: { variant?: "primary" | "secondary"; className?: string }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return <span className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-5 text-sm text-[var(--muted)] ${className}`} role="status"><LoaderCircle className="size-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />Checking account…</span>;

  const destination = user?.role === "admin"
    ? { href: "/admin", label: "Open Admin Dashboard" }
    : user
      ? { href: "/services", label: "Book an Appointment" }
      : { href: "/login?next=%2Fservices", label: "Book an Appointment" };

  return <Button asChild variant={variant} className={className}>
    <Link href={destination.href}>{destination.label}<ArrowRight className="size-4" aria-hidden="true" /></Link>
  </Button>;
}
