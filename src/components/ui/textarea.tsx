import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  invalid?: boolean;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { className, invalid = false, ...props },
  ref,
) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || props["aria-invalid"] || undefined}
      className={cn(
        "min-h-28 w-full resize-y rounded-xl border bg-[var(--background-raised)] px-4 py-3 text-sm leading-6 text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--green-light)] focus:ring-2 focus:ring-[var(--green-light)]/15 disabled:cursor-not-allowed disabled:opacity-55",
        invalid ? "border-red-500/70" : "border-[var(--border)]",
        className,
      )}
      {...props}
    />
  );
});
