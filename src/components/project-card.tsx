import { ExternalLink, GitFork, Star, Folder } from "lucide-react";
import { languageColors, type Project } from "../lib/github";
import { useI18n } from "../lib/i18n";
import { motion } from "framer-motion";

export function ProjectCard({ project }: { project: Project }) {
  const { t } = useI18n();

  return (
    <motion.article 
      layout
      className="portfolio-card h-full"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="portfolio-card__meta">
            Project
          </div>
          <h3 className="portfolio-card__title group-hover:text-primary transition-colors">
            <a href={project.url} target="_blank" rel="noreferrer">
              {project.name}
            </a>
          </h3>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <span className="flex items-center gap-1.5 rounded-full bg-primary/5 px-2.5 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-primary border border-primary/10">
            <Star className="size-3" /> {project.stars}
          </span>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
        {project.description}
      </p>

      <div className="mt-auto pt-6 flex flex-wrap gap-2">
        {project.topics.slice(0, 3).map((topic) => (
          <span key={topic} className="tag-monochrome">
            #{topic}
          </span>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-rule pt-4">
        {project.language ? (
          <div className="flex items-center gap-2">
            <span
              className="size-1.5 rounded-full"
              style={{
                backgroundColor:
                  project.languageColor ?? languageColors[project.language] ?? "currentColor",
              }}
              aria-hidden
            />
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{project.language}</span>
          </div>
        ) : <div />}
        
        <div className="flex items-center gap-4">
          <a
            href={project.homepage || project.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold tracking-tight text-primary hover:opacity-80 transition-opacity"
          >
            {project.homepage ? t.projects.demo : t.projects.code} <ExternalLink className="size-3" />
          </a>
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
