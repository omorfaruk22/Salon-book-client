import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps extends React.ComponentProps<"select"> {
  invalid?: boolean;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, invalid = false, children, ...props },
  ref,
) {
  return (
    <span className="relative block">
      <select
        ref={ref}
        aria-invalid={invalid || props["aria-invalid"] || undefined}
        className={cn(
          "min-h-12 w-full appearance-none rounded-xl border bg-[var(--background-raised)] px-4 py-3 pr-10 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--green-light)] focus:ring-2 focus:ring-[var(--green-light)]/15 disabled:cursor-not-allowed disabled:opacity-55 [color-scheme:dark]",
          invalid ? "border-red-500/70" : "border-[var(--border)]",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
    </span>
  );
});
