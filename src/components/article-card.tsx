import { ArrowUpRight, Clock, BookOpen } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatDate, type Article } from "@/lib/medium";
import { motion } from "framer-motion";

export function ArticleCard({ article }: { article: Article }) {
  const { t } = useI18n();

  return (
    <motion.article 
      layout
      className="card-modern group flex h-full flex-col overflow-hidden rounded-3xl"
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {article.thumbnail ? (
          <img
            src={article.thumbnail}
            alt={t.articles.cover(article.title)}
            loading="lazy"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-primary/5">
            <BookOpen className="size-8 text-primary/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
          <span>{formatDate(article.publishedAt)}</span>
          <div className="flex items-center gap-1">
            <Clock className="size-3" />
            <span>{article.readingMinutes} min read</span>
          </div>
        </div>

        <h3 className="mt-4 text-xl font-bold leading-tight group-hover:text-primary transition-colors">
          <a href={article.link} target="_blank" rel="noreferrer">
            {article.title}
          </a>
        </h3>

        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">
          {article.excerpt}
        </p>

        <div className="mt-6 flex items-center justify-between">
          <div className="flex gap-2">
            {article.categories.slice(0, 2).map((cat) => (
              <span key={cat} className="text-[10px] font-mono text-primary/60">
                #{cat}
              </span>
            ))}
          </div>
          <a
            href={article.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:gap-2 transition-all"
          >
            {t.articles.read} <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="card-modern h-[400px] overflow-hidden rounded-3xl opacity-50">
      <div className="skeleton-block aspect-[16/9] w-full rounded-none" />
      <div className="p-6 space-y-4">
        <div className="flex justify-between">
          <div className="skeleton-block h-3 w-20" />
          <div className="skeleton-block h-3 w-16" />
        </div>
        <div className="skeleton-block h-6 w-full" />
        <div className="skeleton-block h-4 w-5/6" />
        <div className="mt-auto flex justify-between pt-2">
          <div className="skeleton-block h-3 w-24" />
          <div className="skeleton-block h-3 w-12" />
        </div>
      </div>
    </div>
  );
}
