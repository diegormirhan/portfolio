/*
 * Dados externos buscados no build. Cada função devolve um valor vazio em caso de falha:
 * o site sai sem a lista, mas o build nunca quebra por causa da rede.
 * Promessas memorizadas: várias páginas pedem o mesmo dado e ele é buscado uma vez só.
 */
import { pathFor, profile, type Lang } from "./content";

const memo = <T>(fn: () => Promise<T>) => {
  let cached: Promise<T> | undefined;
  return () => (cached ??= fn());
};

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { "User-Agent": "diegomirhan.com build" } });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return (await res.json()) as T;
}

/* ---------- GitHub ---------- */

export type Repo = { name: string; description: string; language: string | null; stars: number; url: string };

type Pinned = { author?: string; name?: string; description?: string; language?: string; stars?: number | string };
type Rest = {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  fork: boolean;
  archived: boolean;
};

export const getRepos = memo(async (): Promise<Repo[]> => {
  const user = profile.githubUser;
  try {
    const pinned = await getJson<Pinned[]>(`https://pinned.berrysauce.dev/get/${user}`);
    if (!pinned.length) throw new Error("no pinned repos");
    return pinned.map((repo) => ({
      name: repo.name ?? "",
      description: repo.description ?? "",
      language: repo.language ?? null,
      stars: Number(repo.stars ?? 0) || 0,
      url: `https://github.com/${repo.author ?? user}/${repo.name}`,
    }));
  } catch {
    try {
      const all = await getJson<Rest[]>(`https://api.github.com/users/${user}/repos?per_page=100&sort=updated`);
      return all
        .filter((repo) => !repo.fork && !repo.archived)
        .sort((a, b) => b.stargazers_count - a.stargazers_count)
        .slice(0, 6)
        .map((repo) => ({
          name: repo.name,
          description: repo.description ?? "",
          language: repo.language,
          stars: repo.stargazers_count,
          url: repo.html_url,
        }));
    } catch (error) {
      console.warn("[data] GitHub indisponível:", error);
      return [];
    }
  }
});

/* ---------- Medium ---------- */

export type Article = {
  id: string;
  /** Último trecho da URL do Medium, sem o id final: vira a URL da página no site */
  slug: string;
  title: string;
  link: string;
  /** Conteúdo completo, já limpo (ver cleanArticle) */
  html: string;
  date: Date | null;
  thumbnail: string | null;
  minutes: number;
  lang: Lang;
};

type FeedItem = { guid?: string; title?: string; link?: string; pubDate?: string; thumbnail?: string; content?: string; description?: string };

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, " ").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();

const PT = new Set(
  "de da do das dos que não nao para com uma um os as em no na nos nas por mais como é são sao ao seu sua isso esse essa este esta também tambem sobre entre quando você voce".split(" "),
);
const EN = new Set(
  "the of and to in is are for with that this it on as be by from an or not how what why you your can will we our their its into about when than".split(" "),
);

/*
 * O HTML vem do feed do próprio Medium, mas passa por limpeza antes de ir para a página:
 * sai o pixel de estatística, qualquer <script>/<style>, atributos on* e links javascript:;
 * o título repetido no topo também sai (a página já tem o título grande).
 */
function cleanArticle(html: string, title: string) {
  return html
    .replace(/<img[^>]+medium\.com\/_\/stat[^>]*>/gi, "")
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/href="javascript:[^"]*"/gi, 'href="#"')
    .replace(/^\s*<h[1-4]>([\s\S]*?)<\/h[1-4]>/i, (m, heading: string) =>
      stripHtml(heading).toLowerCase().startsWith(title.toLowerCase().slice(0, 20)) ? "" : m,
    )
    .replace(/<a /g, '<a target="_blank" rel="noreferrer" ')
    .replace(/<img /g, '<img loading="lazy" decoding="async" ')
    .replace(/<iframe /g, '<iframe loading="lazy" ');
}

const slugFrom = (link: string) => {
  const last = decodeURIComponent(new URL(link).pathname.split("/").filter(Boolean).pop() ?? "");
  // "titulo-do-post-7088ebd132a1": tira o id hexadecimal do fim e os acentos
  return last
    .replace(/-[0-9a-f]{8,}$/, "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// O Medium não informa o idioma do post: inferimos pela frequência de stopwords.
export function detectLang(text: string): Lang {
  let pt = /[ãõç]/i.test(text) ? 2 : 0;
  let en = 0;
  for (const word of text.toLowerCase().split(/[^\p{L}]+/u)) {
    if (PT.has(word)) pt++;
    else if (EN.has(word)) en++;
  }
  return en > pt ? "en" : "pt";
}

export const getArticles = memo(async (): Promise<Article[]> => {
  try {
    // O rss2json guarda cada URL de feed em cache por muito tempo; um parâmetro que muda a cada
    // 10 min força uma leitura nova, então posts recém-publicados entram no próximo build.
    const bucket = Math.floor(Date.now() / 600_000);
    const feed = encodeURIComponent(`https://medium.com/feed/${profile.mediumUser}?v=${bucket}`);
    const data = await getJson<{ status: string; items?: FeedItem[] }>(
      `https://api.rss2json.com/v1/api.json?rss_url=${feed}`,
    );
    if (data.status !== "ok" || !data.items) throw new Error("feed indisponível");
    return data.items.map((item, index) => {
      const html = item.content ?? item.description ?? "";
      const text = stripHtml(html);
      const date = item.pubDate ? new Date(item.pubDate.replace(" ", "T")) : null;
      const link = (item.link ?? profile.medium).split("?")[0]!;
      return {
        id: item.guid ?? item.link ?? String(index),
        slug: slugFrom(link) || `artigo-${index}`,
        title: item.title ?? "",
        link,
        html: cleanArticle(html, item.title ?? ""),
        date: date && !Number.isNaN(date.getTime()) ? date : null,
        thumbnail: item.thumbnail || html.match(/<img[^>]+src="([^"]+)"/i)?.[1] || null,
        minutes: Math.max(1, Math.round(text.split(" ").length / 200)),
        lang: detectLang(`${item.title ?? ""} ${text.slice(0, 1500)}`),
      };
    });
  } catch (error) {
    console.warn("[data] Medium indisponível:", error);
    return [];
  }
});

export const articlesFor = async (lang: Lang) => (await getArticles()).filter((a) => a.lang === lang);

export const articlePath = (lang: Lang, slug: string) => `${pathFor(lang, "blog")}${slug}/`;

export const formatDate = (date: Date | null, lang: Lang) =>
  date
    ? new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : "en-US", { month: "short", year: "numeric" }).format(date)
    : "";
