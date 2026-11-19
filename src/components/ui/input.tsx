import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.ComponentProps<"input"> {
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid = false, ...props },
  ref,
) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || props["aria-invalid"] || undefined}
      className={cn(
        "min-h-12 w-full rounded-xl border bg-[var(--background-raised)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 hover:border-[var(--border)] focus:border-[var(--green-light)] focus:ring-2 focus:ring-[var(--green-light)]/15 disabled:cursor-not-allowed disabled:opacity-55",
        invalid ? "border-red-500/70 focus:border-red-400 focus:ring-red-500/15" : "border-[var(--border)]",
        className,
      )}
      {...props}
    />
  );
});
