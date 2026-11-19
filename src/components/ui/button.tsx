import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--green-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-55 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        primary: "bg-[var(--primary)] text-white shadow-[0_8px_24px_rgb(22_163_74_/_16%)] hover:-translate-y-0.5 hover:bg-[var(--primary-hover)] active:translate-y-0",
        secondary: "border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] hover:border-[var(--green-light)]/60 hover:bg-[var(--card)]",
        ghost: "bg-transparent text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)]",
        danger: "border border-red-900/80 bg-red-950/60 text-red-100 hover:bg-red-900/70",
        link: "min-h-0 rounded-md px-0 py-0 text-[var(--green-light)] shadow-none hover:text-[var(--green-soft)] hover:underline",
      },
      size: {
        sm: "min-h-9 rounded-lg px-3.5 py-2 text-xs",
        md: "",
        lg: "min-h-13 rounded-2xl px-7 py-3 text-base",
        icon: "size-10 min-h-10 rounded-xl p-0",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { asChild = false, className, variant, size, type = "button", ...props },
  ref,
) {
  const Component = asChild ? Slot : "button";
  return <Component ref={ref} {...(!asChild ? { type } : {})} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});
