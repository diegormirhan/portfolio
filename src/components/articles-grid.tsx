import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { ArticleCard, ArticleCardSkeleton } from "./article-card";
import { Reveal } from "./reveal";
import { articlesQueryOptions } from "../lib/medium";
import { useI18n } from "../lib/i18n";
import { profile } from "../lib/site-data";

export function ArticlesGrid({ limit }: { limit?: number }) {
  const { lang, t } = useI18n();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const { data, isPending, isError } = useQuery({ ...articlesQueryOptions, enabled: hydrated });

  if (isPending) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: limit ?? 6 }).map((_, index) => (
          <ArticleCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  const inLang = data?.filter((article) => article.lang === lang) ?? [];

  if (isError || inLang.length === 0) {
    return (
      <div className="surface-card p-8 text-center">
        <p className="text-sm text-muted-foreground">
          {t.articles.error}{" "}
          <a
            href={profile.medium}
            target="_blank"
            rel="noreferrer"
            className="text-primary hover:underline"
          >
            {t.articles.errorLink}
          </a>
        </p>
      </div>
    );
  }

  const articles = limit ? inLang.slice(0, limit) : inLang;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {articles.map((article, idx) => (
        <Reveal key={article.id} className="h-full" delay={(idx % 3) * 0.05}>
          <ArticleCard article={article} />
        </Reveal>
      ))}
    </div>
  );
}
