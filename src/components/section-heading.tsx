import type { ReactNode } from "react";

import { cn } from "../lib/utils";

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
          <span className="inline-flex rounded-md border border-primary/20 bg-primary/5 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </span>
        ) : null}
        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-5xl">{title}</h2>
        {description ? <p className="mt-3 text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}
