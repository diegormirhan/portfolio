import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  className?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div className="max-w-2xl">
        {eyebrow ? (
          <span className="glass-pill inline-flex rounded-full px-4 py-1.5 font-mono text-xs uppercase tracking-[0.25em] text-primary">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="mt-2 text-3xl font-semibold sm:text-4xl">{title}</h2>
        {description ? <p className="mt-3 text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
