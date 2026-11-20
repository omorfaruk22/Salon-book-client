import { Container } from "@/components/ui/container";
import { Skeleton } from "@/components/ui/skeleton";

export default function ServiceDetailsLoading() {
  return (
    <main className="py-8 sm:py-12" aria-busy="true" aria-label="Loading service details">
      <Container className="max-w-6xl">
        <Skeleton className="h-9 w-56" />
        <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1.45fr)_minmax(18rem,.75fr)] lg:gap-7">
          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] p-4 sm:p-6">
            <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
            <Skeleton className="mt-6 h-5 w-36" />
            <Skeleton className="mt-4 h-9 w-3/4" />
            <Skeleton className="mt-5 h-24 w-full" />
            <div className="mt-6 grid gap-3 sm:grid-cols-2"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
          </div>
          <Skeleton className="h-80 rounded-[var(--radius-card)]" />
        </div>
      </Container>
    </main>
  );
}
