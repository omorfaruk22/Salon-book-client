import type { ReactNode } from "react";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  headingLevel?: "h1" | "h2" | "h3";
  headingId?: string;
};

export function SectionHeading({ eyebrow, title, description, action, className = "", headingLevel = "h1", headingId }: SectionHeadingProps) {
  const Heading = headingLevel;
  return (
    <div className={`flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="max-w-3xl">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--green-light)]">{eyebrow}</p>}
        <Heading id={headingId} className="mt-3 text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">{title}</Heading>
        {description && <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base sm:leading-7">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
