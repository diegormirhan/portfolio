import { ArrowUpRight, Clock } from "lucide-react";

import { useI18n } from "@/lib/i18n";
import { formatDate, type Article } from "@/lib/medium";

import { motion } from "framer-motion";

export function ArticleCard({ article }: { article: Article }) {
  const { t } = useI18n();

  return (
    <motion.article 
      whileHover={{ y: -5, scale: 1.01 }}
      className="card-glow flex h-full flex-col overflow-hidden rounded-2xl border border-border"
    >
      {article.thumbnail ? (
        <img
          src={article.thumbnail}
          alt={t.articles.cover(article.title)}
          loading="lazy"
          className="h-44 w-full object-cover"
        />
      ) : (
        <div className="h-44 w-full bg-accent" aria-hidden />
      )}
      <div className="glass-liquid flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{formatDate(article.publishedAt)}</span>
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden /> {article.readingMinutes} min
          </span>
        </div>
        <h3 className="mt-3 text-lg font-semibold">
          <a href={article.link} target="_blank" rel="noreferrer" className="hover:text-primary">
            {article.title}
          </a>
        </h3>
        <p className="mt-2 flex-1 text-sm text-muted-foreground">{article.excerpt}</p>
        {article.categories.length > 0 ? (
          <ul className="mt-4 flex flex-wrap gap-2">
            {article.categories.map((category) => (
              <li
                key={category}
                className="rounded-full bg-secondary px-2.5 py-1 font-mono text-[11px] text-secondary-foreground"
              >
                {category}
              </li>
            ))}
          </ul>
        ) : null}
        <a
          href={article.link}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          {t.articles.read} <ArrowUpRight className="size-4" aria-hidden />
        </a>
      </div>
    </motion.article>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div
      className="flex h-80 flex-col overflow-hidden rounded-2xl border border-border"
      aria-hidden
    >
      <div className="skeleton-block h-44 w-full rounded-none" />
      <div className="glass-liquid flex flex-1 flex-col gap-3 p-6">
        <div className="skeleton-block h-3 w-28" />
        <div className="skeleton-block h-5 w-4/5" />
        <div className="skeleton-block h-3 w-full" />
        <div className="skeleton-block h-3 w-2/3" />
      </div>
    </div>
  );
}
