import { queryOptions } from "@tanstack/react-query";

import type { Lang } from "./i18n";
import { profile } from "./site-data";

export type Article = {
  id: string;
  title: string;
  link: string;
  publishedAt: string;
  thumbnail: string | null;
  excerpt: string;
  categories: string[];
  readingMinutes: number;
  lang: Lang;
};

type Rss2JsonItem = {
  guid?: string;
  title?: string;
  link?: string;
  pubDate?: string;
  thumbnail?: string;
  description?: string;
  content?: string;
  categories?: string[];
};

type Rss2JsonResponse = {
  status: string;
  items?: Rss2JsonItem[];
};

const stripHtml = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const firstImage = (html: string) => {
  const match = html.match(/<img[^>]+src="([^"]+)"/i);
  return match?.[1] ?? null;
};

const PT_WORDS = new Set(
  "de da do das dos que não nao para com uma um os as em no na nos nas por mais como é são sao ao seu sua isso esse essa este esta também tambem sobre entre quando você voce".split(
    " ",
  ),
);
const EN_WORDS = new Set(
  "the of and to in is are for with that this it on as be by from an or not how what why you your can will we our their its into about when than".split(
    " ",
  ),
);

// Medium doesn't expose a post language, so infer it from stopword frequency.
export function detectLang(text: string): Lang {
  let pt = 0;
  let en = 0;
  for (const word of text.toLowerCase().split(/[^\p{L}]+/u)) {
    if (PT_WORDS.has(word)) pt++;
    else if (EN_WORDS.has(word)) en++;
  }
  if (/[ãõç]/i.test(text)) pt += 2;
  return en > pt ? "en" : "pt";
}

// rss2json caches each feed URL for a long time; a rotating query param forces a fresh
// read so newly published posts show up within minutes.
const FEED_REFRESH_MS = 1000 * 60 * 10;

export async function fetchArticles(user = profile.mediumUser): Promise<Article[]> {
  const bucket = Math.floor(Date.now() / FEED_REFRESH_MS);
  const feed = `https://medium.com/feed/${user}?v=${bucket}`;
  const res = await fetch(
    `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}`,
  );
  if (!res.ok) throw new Error(`Não foi possível carregar o feed (${res.status})`);
  const data = (await res.json()) as Rss2JsonResponse;
  if (data.status !== "ok" || !data.items) throw new Error("Feed do Medium indisponível");

  return data.items.map((item, index) => {
    const html = item.content ?? item.description ?? "";
    const text = stripHtml(html);
    return {
      id: item.guid ?? item.link ?? String(index),
      title: item.title ?? "Sem título",
      link: item.link ?? profile.medium,
      publishedAt: item.pubDate ?? "",
      thumbnail: item.thumbnail && item.thumbnail.length > 0 ? item.thumbnail : firstImage(html),
      excerpt: text.slice(0, 180) + (text.length > 180 ? "…" : ""),
      categories: (item.categories ?? []).slice(0, 3),
      readingMinutes: Math.max(1, Math.round(text.split(" ").length / 200)),
      lang: detectLang(`${item.title ?? ""} ${text.slice(0, 1500)}`),
    };
  });
}

export const articlesQueryOptions = queryOptions({
  queryKey: ["medium", "articles", profile.mediumUser],
  queryFn: () => fetchArticles(),
  staleTime: FEED_REFRESH_MS,
  retry: 1,
});

export function formatDate(value: string, lang: Lang = "pt") {
  if (!value) return "";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : "en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
