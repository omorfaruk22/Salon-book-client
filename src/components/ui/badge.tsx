import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize leading-5", {
  variants: {
    variant: {
      default: "bg-[var(--primary)]/15 text-[var(--green-light)]",
      success: "bg-emerald-500/12 text-emerald-300 ring-1 ring-inset ring-emerald-400/15",
      warning: "bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-400/15",
      danger: "bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-400/15",
      info: "bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-400/15",
      neutral: "bg-white/5 text-[var(--muted)] ring-1 ring-inset ring-white/10",
      outline: "border border-[var(--border)] text-[var(--muted)]",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
