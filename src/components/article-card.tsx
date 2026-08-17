import { ArrowUpRight, Clock, BookOpen } from "lucide-react";
import { useI18n } from "../lib/i18n";
import { formatDate, type Article } from "../lib/medium";
import { motion } from "framer-motion";

export function ArticleCard({ article }: { article: Article }) {
  const { t } = useI18n();

  return (
    <motion.article 
      layout
      className="portfolio-card group flex h-full flex-col overflow-hidden"
    >
      <div className="relative aspect-[16/9] overflow-hidden -mx-[var(--space-lg)] -mt-[var(--space-lg)] mb-[var(--space-lg)] border-b border-rule">
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
      </div>

      <div className="portfolio-card__meta flex justify-between">
        <span>{formatDate(article.publishedAt)}</span>
        <span className="flex items-center gap-1">
          <Clock className="size-3" />
          {article.readingMinutes} min
        </span>
      </div>

      <h3 className="portfolio-card__title">
        <a href={article.link} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
          {article.title}
        </a>
      </h3>

      <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
        {article.excerpt}
      </p>

      <div className="portfolio-card__tags">
        {article.categories.slice(0, 3).map((cat) => (
          <span key={cat} className="tag-monochrome">
            #{cat}
          </span>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-end border-t border-rule pt-4">
        <a
          href={article.link}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold tracking-tight text-primary hover:gap-2 transition-all"
        >
          {t.articles.read} <ArrowUpRight className="size-3.5" />
        </a>
      </div>
    </motion.article>
  );

}

export function ArticleCardSkeleton() {
  return (
    <div className="portfolio-card h-[400px] overflow-hidden opacity-50">
      <div className="aspect-[16/9] w-full bg-muted/20 animate-pulse rounded-none" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between">
          <div className="h-3 w-20 bg-muted/20 animate-pulse rounded" />
          <div className="h-3 w-16 bg-muted/20 animate-pulse rounded" />
        </div>
        <div className="h-6 w-full bg-muted/20 animate-pulse rounded" />
        <div className="h-4 w-5/6 bg-muted/20 animate-pulse rounded" />
        <div className="mt-auto flex justify-between pt-2">
          <div className="h-3 w-24 bg-muted/20 animate-pulse rounded" />
          <div className="h-3 w-12 bg-muted/20 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}