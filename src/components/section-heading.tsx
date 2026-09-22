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
    <div className={cn("flex flex-wrap items-end justify-between gap-x-8 gap-y-4", className)}>
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-title mt-2">{title}</h2>
        {description ? (
          <p className="text-lede mt-4 max-w-2xl text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
