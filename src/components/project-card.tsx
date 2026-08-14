import { ExternalLink, GitFork, Star } from "lucide-react";

import { languageColors, type Project } from "@/lib/github";
import { useI18n } from "@/lib/i18n";

export function ProjectCard({ project }: { project: Project }) {
  const { t } = useI18n();

  return (
    <article className="glass-liquid card-glow flex h-full flex-col rounded-2xl p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold">
          <a href={project.url} target="_blank" rel="noreferrer" className="hover:text-primary">
            {project.name}
          </a>
        </h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star className="size-3.5" aria-hidden /> {project.stars}
          </span>
          <span className="inline-flex items-center gap-1">
            <GitFork className="size-3.5" aria-hidden /> {project.forks}
          </span>
        </div>
      </div>

      <p className="mt-3 flex-1 text-sm text-muted-foreground">{project.description}</p>

      {project.topics.length > 0 ? (
        <ul className="mt-4 flex flex-wrap gap-2">
          {project.topics.slice(0, 4).map((topic) => (
            <li
              key={topic}
              className="rounded-full bg-secondary px-2.5 py-1 font-mono text-[11px] text-secondary-foreground"
            >
              {topic}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4 text-xs">
        {project.language ? (
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <span
              className="size-2.5 rounded-full"
              style={{
                backgroundColor:
                  project.languageColor ?? languageColors[project.language] ?? "currentColor",
              }}
              aria-hidden
            />
            {project.language}
          </span>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-3">
          <a href={project.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
            {t.projects.code}
          </a>
          {project.homepage ? (
            <a
              href={project.homepage}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
            >
              {t.projects.demo} <ExternalLink className="size-3" aria-hidden />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div
      className="glass-liquid flex h-56 flex-col rounded-2xl p-6"
      aria-hidden
    >
      <div className="flex items-start justify-between gap-3">
        <div className="skeleton-block h-5 w-1/2" />
        <div className="skeleton-block h-4 w-16" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="skeleton-block h-3 w-full" />
        <div className="skeleton-block h-3 w-11/12" />
        <div className="skeleton-block h-3 w-2/3" />
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
        <div className="skeleton-block h-3 w-20" />
        <div className="skeleton-block h-3 w-24" />
      </div>
    </div>
  );
}
