import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function LoadingSpinner({ label = "Loading", className }: { label?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm text-[var(--muted)]", className)} role="status" aria-live="polite">
      <LoaderCircle className="size-4 animate-spin text-[var(--green-light)] motion-reduce:animate-none" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
