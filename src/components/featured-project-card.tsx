import { ArrowUpRight } from "lucide-react";

import { useI18n } from "../lib/i18n";
import type { FeaturedProject } from "../lib/site-data";
import { cn } from "../lib/utils";

const ease = "ease-[cubic-bezier(0.25,1,0.5,1)]";

export function FeaturedProjectCard({
  project,
  wide = false,
}: {
  project: FeaturedProject;
  wide?: boolean;
}) {
  const { t } = useI18n();
  const [name, tagline] = project.title.split(" — ");

  return (
    <article
      className={cn(
        "surface-card group relative isolate flex h-full flex-col overflow-hidden transition-colors duration-200 hover:bg-secondary",
        wide && "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]",
      )}
    >
      <div className={cn("flex flex-col p-7 sm:p-8", wide && "lg:p-10 lg:pr-4")}>
        <div className="flex items-center justify-between">
          <span className="text-caption tabular-nums text-muted-foreground">{project.year}</span>
          <ArrowUpRight
            className="size-5 text-muted-foreground transition-[translate,color] duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
            aria-hidden
          />
        </div>
        <h3
          className={cn(
            "mt-4",
            wide
              ? "text-headline lg:text-[1.75rem] lg:leading-tight lg:tracking-[-0.025em]"
              : "text-headline",
          )}
        >
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="after:absolute after:inset-0 after:z-0 after:rounded-[inherit]"
          >
            {name}
            {tagline ? <span className="block text-muted-foreground">{tagline}</span> : null}
          </a>
        </h3>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted-foreground">
          {project.description}
        </p>
        <div className="text-caption mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-muted-foreground">
          <span>{project.tags.join(" · ")}</span>
          {project.demo ? (
            <a
              href={project.demo}
              target="_blank"
              rel="noreferrer"
              className="relative z-10 font-medium text-primary hover:underline"
            >
              {t.projects.demo}
            </a>
          ) : null}
        </div>
      </div>

      {project.image && project.imageFit === "window" ? (
        <div
          className={cn(
            "flex items-center justify-center px-7 pb-7 sm:px-8 sm:pb-8",
            wide && "lg:py-10 lg:pl-4 lg:pr-10",
          )}
        >
          <img
            src={project.image}
            alt={project.imageAlt ?? ""}
            loading="lazy"
            decoding="async"
            className={cn(
              "w-full max-w-[26rem] rounded-xl shadow-[0_0_0_1px_var(--color-border),0_24px_48px_-20px_oklch(0_0_0/0.55)] transition-transform duration-500 group-hover:-translate-y-1.5",
              ease,
            )}
          />
        </div>
      ) : project.image ? (
        <div
          className={cn(
            "relative mt-auto aspect-[16/9] overflow-hidden px-7 sm:px-8",
            wide && "lg:mt-0 lg:aspect-auto lg:min-h-[22rem] lg:pl-4 lg:pr-0 lg:pt-10",
          )}
        >
          <img
            src={project.image}
            alt={project.imageAlt ?? ""}
            loading="lazy"
            decoding="async"
            className={cn(
              "absolute left-7 top-2 min-h-[calc(100%+1rem)] w-[calc(100%-3.5rem)] rounded-t-xl object-cover object-left-top shadow-[0_0_0_1px_var(--color-border),0_-12px_40px_-16px_oklch(0_0_0/0.45)] transition-transform duration-500 group-hover:-translate-y-1.5 sm:left-8 sm:w-[calc(100%-4rem)]",
              ease,
              wide && "lg:left-4 lg:top-10 lg:w-[140%] lg:max-w-none",
            )}
          />
        </div>
      ) : null}
    </article>
  );
}
