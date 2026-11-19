import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

export function CategoryCard({ title, description, count, href, icon }: { title: string; description: string; count?: number; href: string; icon: ReactNode }) {
  return (
    <Link href={href} className="group flex min-h-44 flex-col rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--card)] p-5 transition duration-200 hover:-translate-y-1 hover:border-[var(--green-light)]/50 hover:bg-[#18221b] motion-reduce:transition-none">
      <div className="flex items-start justify-between gap-4">
        <span className="grid size-11 place-items-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--green-light)]">{icon}</span>
        <ArrowUpRight className="size-4 text-[var(--muted)] transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--green-light)]" aria-hidden="true" />
      </div>
      <div className="mt-auto pt-7">
        <div className="flex items-center gap-2"><h3 className="font-semibold">{title}</h3>{count !== undefined && <span className="text-xs text-[var(--muted)]">{count}</span>}</div>
        <p className="mt-1.5 text-sm leading-5 text-[var(--muted)]">{description}</p>
      </div>
    </Link>
  );
}
