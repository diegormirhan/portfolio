/*
 * Dados externos buscados no build. Cada função devolve um valor vazio em caso de falha:
 * o site sai sem a lista, mas o build nunca quebra por causa da rede.
 * Promessas memorizadas: várias páginas pedem o mesmo dado e ele é buscado uma vez só.
 */
import { blogUrl, profile, type Lang } from "./content";

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

/* ---------- Blog (Ghost) ---------- */

export type Article = { id: string; title: string; link: string; date: Date | null; thumbnail: string | null };

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
const tag = (xml: string, name: string) => decode(xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`))?.[1] ?? "");

// O post marcado "Feature this post" no Ghost vem primeiro. O RSS não diz qual é: o tema do blog marca o endereço
// dele na home (data-featured-url). Sem destaque, ou com o blog fora do ar, a ordem é só por data.
const meta = (html: string, prop: string) =>
  decode(html.match(new RegExp(`<meta[^>]+(?:property|name)="${prop}"[^>]+content="([^"]*)"`))?.[1] ?? "");
async function withFeaturedFirst(list: Article[]): Promise<Article[]> {
  try {
    const headers = { "User-Agent": "diegomirhan.com build" };
    const home = await (await fetch(blogUrl, { headers })).text();
    const url = home.match(/data-featured-url="([^"]+)"/)?.[1];
    if (!url) return list;
    const found = list.find((a) => a.link === url);
    if (found) return [found, ...list.filter((a) => a !== found)];
    // destaque antigo, fora do RSS: título, data e imagem vêm da própria página do post
    const page = await (await fetch(url, { headers })).text();
    const date = new Date(meta(page, "article:published_time"));
    const featured: Article = {
      id: url,
      title: meta(page, "og:title"),
      link: url,
      date: Number.isNaN(date.getTime()) ? null : date,
      thumbnail: meta(page, "og:image") || null,
    };
    return featured.title ? [featured, ...list] : list;
  } catch (error) {
    console.warn("[data] destaque do blog indisponível:", error);
    return list;
  }
}

// Posts do blog (blog.diegomirhan.com), mais recentes primeiro, lidos do RSS público do Ghost no build.
// Os links vão direto para o post no blog: o portfolio não tem mais páginas de artigo.
export const getArticles = memo(async (): Promise<Article[]> => {
  try {
    const res = await fetch(`${blogUrl}rss/`, { headers: { "User-Agent": "diegomirhan.com build" } });
    if (!res.ok) throw new Error(`rss -> ${res.status}`);
    const xml = await res.text();
    const list: Article[] = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map(([, item], index) => {
      const date = new Date(tag(item!, "pubDate"));
      return {
        id: tag(item!, "guid") || String(index),
        title: tag(item!, "title"),
        link: tag(item!, "link"),
        date: Number.isNaN(date.getTime()) ? null : date,
        thumbnail: item!.match(/<media:content[^>]+url="([^"]+)"/)?.[1] ?? null,
      };
    });
    return withFeaturedFirst(list);
  } catch (error) {
    console.warn("[data] blog indisponível:", error);
    return [];
  }
});

export const formatDate = (date: Date | null, lang: Lang) =>
  date
    ? new Intl.DateTimeFormat(lang === "pt" ? "pt-BR" : "en-US", { month: "short", year: "numeric" }).format(date)
    : "";
