import { ArrowUpRight, BookOpen } from "lucide-react";

import { useI18n } from "../lib/i18n";
import { formatDate, type Article } from "../lib/medium";

export function ArticleCard({ article }: { article: Article }) {
  const { t } = useI18n();

  return (
    <article className="surface-card pressable group relative flex h-full flex-col overflow-hidden transition-colors duration-200 hover:bg-secondary">
      <div className="relative aspect-[16/10] overflow-hidden">
        {article.thumbnail ? (
          <img
            src={article.thumbnail}
            alt={t.articles.cover(article.title)}
            loading="lazy"
            className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-secondary">
            <BookOpen className="size-7 text-muted-foreground/50" aria-hidden />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="text-caption tabular-nums text-muted-foreground">
          {formatDate(article.publishedAt)} · {article.readingMinutes} min
        </p>
        <h3 className="text-headline mt-2">
          <a
            href={article.link}
            target="_blank"
            rel="noreferrer"
            className="after:absolute after:inset-0 after:rounded-[inherit]"
          >
            {article.title}
          </a>
        </h3>
        <p className="mt-2 line-clamp-2 flex-1 text-[0.9375rem] leading-relaxed text-muted-foreground">
          {article.excerpt}
        </p>
        <p className="text-caption mt-5 flex items-center gap-1 font-medium text-primary">
          {t.articles.read}
          <ArrowUpRight
            className="size-4 transition-[translate] duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            aria-hidden
          />
        </p>
      </div>
    </article>
  );
}

export function ArticleCardSkeleton() {
  return (
    <div className="surface-card flex flex-col overflow-hidden">
      <div className="skeleton-block aspect-[16/10] w-full rounded-none" />
      <div className="space-y-3 p-6">
        <div className="skeleton-block h-3 w-24" />
        <div className="skeleton-block h-5 w-full" />
        <div className="skeleton-block h-3.5 w-5/6" />
      </div>
    </div>
  );
}
