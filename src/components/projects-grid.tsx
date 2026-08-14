import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { ProjectCard, ProjectCardSkeleton } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { projectsQueryOptions } from "@/lib/github";
import { useI18n } from "@/lib/i18n";
import { profile } from "@/lib/site-data";

export function ProjectsGrid({ limit }: { limit?: number }) {
  const { t } = useI18n();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const { data, isPending, isError } = useQuery({ ...projectsQueryOptions, enabled: hydrated });

  if (isPending) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: limit ?? 6 }).map((_, index) => (
          <ProjectCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (isError || !data || data.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          {t.projects.error}{" "}
          <a href={profile.github} target="_blank" rel="noreferrer" className="text-primary hover:underline">
            {t.projects.errorLink}
          </a>
        </p>
      </div>
    );
  }

  const projects = limit ? data.slice(0, limit) : data;

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, idx) => (
        <Reveal key={project.id} className="h-full" delay={idx * 0.1}>
          <ProjectCard project={project} />
        </Reveal>
      ))}
    </div>
  );
}
