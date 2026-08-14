import { queryOptions } from "@tanstack/react-query";

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

export async function fetchArticles(user = profile.mediumUser): Promise<Article[]> {
  const feed = `https://medium.com/${user}/feed`;
  const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed)}`);
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
    };
  });
}

export const articlesQueryOptions = queryOptions({
  queryKey: ["medium", "articles", profile.mediumUser],
  queryFn: () => fetchArticles(),
  staleTime: 1000 * 60 * 30,
  retry: 1,
});

export function formatDate(value: string) {
  if (!value) return "";
  const date = new Date(value.replace(" ", "T"));
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}
