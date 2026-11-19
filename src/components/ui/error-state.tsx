import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ErrorState({ title = "We couldn't load this right now", description, onRetry, className }: { title?: string; description: string; onRetry?: () => void; className?: string }) {
  return (
    <div role="alert" className={cn("rounded-2xl border border-red-900/60 bg-red-950/25 p-5 sm:p-6", className)}>
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-300" aria-hidden="true" />
        <div>
          <h2 className="font-semibold text-red-100">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-red-200/80">{description}</p>
          {onRetry && <Button className="mt-4" size="sm" variant="secondary" onClick={onRetry}>Try again</Button>}
        </div>
      </div>
    </div>
  );
}
