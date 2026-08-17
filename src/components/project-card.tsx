import { ExternalLink, GitFork, Star, Folder } from "lucide-react";
import { languageColors, type Project } from "../lib/github";
import { useI18n } from "../lib/i18n";
import { motion } from "framer-motion";

export function ProjectCard({ project }: { project: Project }) {
  const { t } = useI18n();

  return (
    <motion.article 
      layout
      className="card-modern group flex h-full flex-col rounded-2xl p-6 sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-primary">
            <Folder className="size-4 opacity-70" />
            <span className="font-mono text-[10px] uppercase tracking-widest opacity-70">Project</span>
          </div>
          <h3 className="mt-2 text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
            <a href={project.url} target="_blank" rel="noreferrer">
              {project.name}
            </a>
          </h3>
        </div>
        <div className="flex flex-col items-end gap-1.5 pt-1">
          <span className="flex items-center gap-1.5 rounded-full bg-primary/5 px-2.5 py-1 text-[11px] font-medium text-primary border border-primary/10">
            <Star className="size-3" /> {project.stars}
          </span>
          {project.forks > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-secondary/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground border border-border">
              <GitFork className="size-3" /> {project.forks}
            </span>
          )}
        </div>
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
        {project.description}
      </p>

      {project.topics.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-1.5">
          {project.topics.slice(0, 3).map((topic) => (
            <li
              key={topic}
              className="rounded-lg bg-secondary/30 px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
            >
              #{topic}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 flex items-center justify-between border-t border-border/40 pt-4">
        {project.language ? (
          <div className="flex items-center gap-2">
            <span
              className="size-2 rounded-full shadow-sm"
              style={{
                backgroundColor:
                  project.languageColor ?? languageColors[project.language] ?? "currentColor",
              }}
              aria-hidden
            />
            <span className="text-xs font-medium text-muted-foreground">{project.language}</span>
          </div>
        ) : <div />}
        
        <div className="flex items-center gap-4">
          <a 
            href={project.url} 
            target="_blank" 
            rel="noreferrer" 
            className="flex items-center gap-1.5 text-xs font-semibold text-foreground/70 hover:text-primary transition-colors"
          >
            {t.projects.code}
          </a>
          {project.homepage && (
            <a
              href={project.homepage}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:opacity-80 transition-opacity"
            >
              {t.projects.demo} <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="card-modern h-[280px] rounded-2xl p-6 opacity-50">
      <div className="flex justify-between">
        <div className="space-y-3 flex-1">
          <div className="skeleton-block h-3 w-20" />
          <div className="skeleton-block h-6 w-3/4" />
        </div>
        <div className="skeleton-block h-6 w-12 rounded-full" />
      </div>
      <div className="mt-6 space-y-2">
        <div className="skeleton-block h-4 w-full" />
        <div className="skeleton-block h-4 w-5/6" />
      </div>
      <div className="mt-auto pt-6 flex justify-between">
        <div className="skeleton-block h-4 w-16" />
        <div className="skeleton-block h-4 w-20" />
      </div>
    </div>
  );
}
