import { ArrowUpRight, Clock, BookOpen } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { formatDate, type Article } from "../lib/medium";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";

export function ArticleCard({ article }: { article: Article }) {
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
      <Card className="technical-card group flex h-full flex-col overflow-hidden">
        <div className="relative aspect-[16/9] overflow-hidden">
          {article.thumbnail ? (
            <img
              src={article.thumbnail}
              alt={t.articles.cover(article.title)}
              loading="lazy"
              className="size-full object-cover grayscale opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0 group-hover:opacity-100"
            />
          ) : (
            <div className="flex size-full items-center justify-center bg-muted/20">
              <BookOpen className="size-8 text-muted" />
            </div>
          )}
          <div className="absolute top-3 right-3">
             <Badge className="bg-background/80 backdrop-blur-sm text-foreground hover:bg-background/90">
                {article.readingMinutes} min
             </Badge>
          </div>
        </div>

        <CardHeader className="space-y-2 pb-2">
          <div className="flex justify-between items-center">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              {formatDate(article.publishedAt)} // LOG_{Math.floor(Math.random() * 1000)}
            </span>
          </div>
          <h3 className="text-lg font-bold leading-tight">
            <a href={article.link} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
              {article.title}
            </a>
          </h3>
        </CardHeader>

        <CardContent className="flex-1">
          <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
            {article.excerpt}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {article.categories.slice(0, 3).map((cat) => (
              <Badge key={cat} variant="outline" className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground/80">
                #{cat}
              </Badge>
            ))}
          </div>
        </CardContent>

        <CardFooter className="border-t border-border/40 pt-4 flex items-center justify-end">
          <a
            href={article.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold tracking-tight text-primary hover:gap-2 transition-all"
          >
            {t.articles.read} <ArrowUpRight className="size-3.5" />
          </a>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export function ArticleCardSkeleton() {
  return (
    <Card className="technical-card h-[400px] overflow-hidden opacity-50 animate-pulse">
      <div className="aspect-[16/9] w-full bg-muted" />
      <CardHeader className="space-y-2">
        <div className="h-3 w-20 bg-muted rounded" />
        <div className="h-6 w-full bg-muted rounded" />
      </CardHeader>
      <CardContent>
        <div className="h-16 w-full bg-muted rounded" />
      </CardContent>
    </Card>
  );
}
