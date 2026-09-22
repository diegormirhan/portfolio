import { ArrowUpRight, GitFork, Star } from "lucide-react";

import { languageColors, type Project } from "../lib/github";
import { useI18n } from "../lib/i18n";

export function ProjectCard({ project }: { project: Project }) {
  const { t } = useI18n();

  return (
    <article className="surface-card group relative flex h-full flex-col p-6 transition-colors duration-200 hover:bg-secondary">
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-headline min-w-0 break-words">
          <a
            href={project.url}
            target="_blank"
            rel="noreferrer"
            className="after:absolute after:inset-0 after:rounded-[inherit] focus-visible:outline-none"
          >
            {project.name}
          </a>
        </h3>
        <ArrowUpRight
          className="mt-1 size-5 shrink-0 text-muted-foreground transition-[translate,color] duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
          aria-hidden
        />
      </div>

      <p className="mt-3 line-clamp-3 flex-1 text-[0.9375rem] leading-relaxed text-muted-foreground">
        {project.description}
      </p>

      <div className="text-caption mt-6 flex items-center gap-4 text-muted-foreground">
        {project.language ? (
          <span className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{
                backgroundColor:
                  project.languageColor ?? languageColors[project.language] ?? "currentColor",
              }}
              aria-hidden
            />
            {project.language}
          </span>
        ) : null}
        <span className="flex items-center gap-1 tabular-nums">
          <Star className="size-3.5" aria-hidden /> {project.stars}
        </span>
        {project.forks > 0 ? (
          <span className="flex items-center gap-1 tabular-nums">
            <GitFork className="size-3.5" aria-hidden /> {project.forks}
          </span>
        ) : null}
        {project.homepage ? (
          <a
            href={project.homepage}
            target="_blank"
            rel="noreferrer"
            className="relative z-10 ml-auto font-medium text-primary hover:underline"
          >
            {t.projects.demo}
          </a>
        ) : null}
      </div>
    </article>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="surface-card flex h-[216px] flex-col p-6">
      <div className="skeleton-block h-5 w-2/3" />
      <div className="mt-5 space-y-2">
        <div className="skeleton-block h-3.5 w-full" />
        <div className="skeleton-block h-3.5 w-5/6" />
      </div>
      <div className="skeleton-block mt-auto h-3 w-24" />
    </div>
  );
}
