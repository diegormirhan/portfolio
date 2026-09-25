/*
 * sitemap.xml gerado no build: todas as páginas nos dois idiomas. Páginas com tradução levam
 * os pares hreflang (xhtml:link); artigos existem num idioma só.
 */
import type { APIRoute } from "astro";

import { langs, pathFor, projectPath, projects, type Lang, type PageKey } from "../lib/content";
import { articlePath, articlesFor } from "../lib/data";

type Entry = { loc: string; alternates?: Record<Lang, string>; lastmod?: Date | null; priority: number };

export const GET: APIRoute = async ({ site }) => {
  const url = (path: string) => new URL(path, site).href;
  const hreflang: Record<Lang, string> = { pt: "pt-BR", en: "en" };
  const entries: Entry[] = [];
  const pair = (make: (lang: Lang) => string, priority: number) => {
    const alternates = { pt: url(make("pt")), en: url(make("en")) };
    for (const lang of langs) entries.push({ loc: alternates[lang], alternates, priority });
  };

  const pages: [PageKey, number][] = [
    ["home", 1],
    ["projects", 0.9],
    ["experience", 0.8],
    ["blog", 0.8],
    ["contact", 0.6],
  ];
  for (const [page, priority] of pages) pair((lang) => pathFor(lang, page), priority);
  for (const project of projects("pt")) pair((lang) => projectPath(lang, project.slug), 0.8);
  for (const lang of langs)
    for (const article of await articlesFor(lang))
      entries.push({ loc: url(articlePath(lang, article.slug)), lastmod: article.date, priority: 0.7 });

  const today = new Date().toISOString().slice(0, 10);
  const body = entries
    .map(({ loc, alternates, lastmod, priority }) => {
      const links = alternates
        ? [
            ...langs.map((lang) => `    <xhtml:link rel="alternate" hreflang="${hreflang[lang]}" href="${alternates[lang]}"/>`),
            `    <xhtml:link rel="alternate" hreflang="x-default" href="${alternates.pt}"/>`,
          ].join("\n")
        : "";
      return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod ? lastmod.toISOString().slice(0, 10) : today}</lastmod>\n    <priority>${priority}</priority>${links ? "\n" + links : ""}\n  </url>`;
    })
    .join("\n");

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${body}\n</urlset>\n`,
    { headers: { "Content-Type": "application/xml; charset=utf-8" } },
  );
};
