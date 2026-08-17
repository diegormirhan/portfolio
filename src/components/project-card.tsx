import { ExternalLink, Star } from "lucide-react";
import { languageColors, type Project } from "../lib/github";
import { useI18n } from "../lib/i18n";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";

export function ProjectCard({ project }: { project: Project }) {
  const { t } = useI18n();

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className="technical-card flex h-full flex-col">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
          <div className="flex flex-col gap-1">
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {t.projects.pinnedTitle} // 0x{project.stars.toString(16).padStart(2, '0')}
            </span>
            <h3 className="text-lg font-bold leading-tight">
              <a href={project.url} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                {project.name}
              </a>
            </h3>
          </div>
          <Badge variant="outline" className="font-mono text-[10px] gap-1 px-2 py-0 border-muted">
            <Star className="size-3 fill-primary text-primary" /> {project.stars}
          </Badge>
        </CardHeader>
        
        <CardContent className="flex-1">
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {project.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {project.topics.slice(0, 3).map((topic) => (
              <Badge key={topic} variant="secondary" className="font-mono text-[9px] uppercase tracking-wider bg-muted text-muted-foreground">
                {topic}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="border-t border-border/40 pt-4 flex items-center justify-between">
          {project.language ? (
            <div className="flex items-center gap-2">
              <span
                className="size-2 rounded-full"
                style={{
                  backgroundColor:
                    project.languageColor ?? languageColors[project.language] ?? "currentColor",
                }}
                aria-hidden
              />
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{project.language}</span>
            </div>
          ) : <div />}
          
          <a
            href={project.homepage || project.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold tracking-tight text-primary hover:opacity-80 transition-opacity"
          >
            {project.homepage ? t.projects.demo : t.projects.code} <ExternalLink className="size-3" />
          </a>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export function ProjectCardSkeleton() {
  return (
    <Card className="glass-card h-[280px] opacity-50 animate-pulse">
      <CardHeader className="space-y-2">
        <div className="h-3 w-20 bg-muted rounded" />
        <div className="h-6 w-3/4 bg-muted rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-20 w-full bg-muted rounded" />
      </CardContent>
    </Card>
  );
}
