import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-lg bg-white/[.06] motion-reduce:animate-none", className)} {...props} />;
}

export function ServiceCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] p-4">
      <Skeleton className="h-44 w-full rounded-xl" />
      <div className="space-y-3 p-2 pt-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="mt-5 h-10 w-full" />
      </div>
    </div>
  );
}
