import type { ReactNode } from "react";

export function EmptyState({ icon, title, description, action }: { icon?: ReactNode; title: string; description: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)]/60 px-6 py-12 text-center sm:px-10">
      {icon && <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl border border-[var(--border)] bg-[var(--card)] text-[var(--green-light)]">{icon}</div>}
      <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--muted)]">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
