import { queryOptions } from "@tanstack/react-query";

import { profile } from "./site-data";

export type Project = {
  id: string;
  name: string;
  description: string;
  language: string | null;
  languageColor?: string | null;
  stars: number;
  forks: number;
  topics: string[];
  url: string;
  homepage: string | null;
};

type PinnedRepo = {
  author?: string;
  name?: string;
  description?: string;
  language?: string;
  languageColor?: string;
  stars?: number | string;
  forks?: number | string;
};

type RestRepo = {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  topics?: string[];
  html_url: string;
  homepage: string | null;
  fork: boolean;
  archived: boolean;
};

const toNumber = (value: number | string | undefined) => Number(value ?? 0) || 0;

async function fetchPinned(user: string): Promise<Project[]> {
  const res = await fetch(`https://pinned.berrysauce.dev/get/${user}`);
  if (!res.ok) throw new Error(`Pinned repos indisponíveis (${res.status})`);
  const data = (await res.json()) as PinnedRepo[];
  if (!Array.isArray(data) || data.length === 0) throw new Error("Nenhum repositório fixado");
  return data.map((repo) => ({
    id: `${repo.author ?? user}/${repo.name}`,
    name: repo.name ?? "",
    description: repo.description ?? "Sem descrição.",
    language: repo.language ?? null,
    languageColor: repo.languageColor ?? null,
    stars: toNumber(repo.stars),
    forks: toNumber(repo.forks),
    topics: [],
    url: `https://github.com/${repo.author ?? user}/${repo.name}`,
    homepage: null,
  }));
}


async function fetchTopRepos(user: string): Promise<Project[]> {
  const res = await fetch(`https://api.github.com/users/${user}/repos?per_page=100&sort=updated`);
  if (!res.ok) throw new Error(`GitHub respondeu ${res.status}`);
  const data = (await res.json()) as RestRepo[];
  return data
    .filter((repo) => !repo.fork && !repo.archived)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 6)
    .map((repo) => ({
      id: String(repo.id),
      name: repo.name,
      description: repo.description ?? "Sem descrição.",
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      topics: repo.topics ?? [],
      url: repo.html_url,
      homepage: repo.homepage,
    }));
}

export async function fetchProjects(user = profile.githubUser): Promise<Project[]> {
  try {
    return await fetchPinned(user);
  } catch {
    return await fetchTopRepos(user);
  }
}

export const projectsQueryOptions = queryOptions({
  queryKey: ["github", "projects", profile.githubUser],
  queryFn: () => fetchProjects(),
  staleTime: 1000 * 60 * 30,
  retry: 1,
});

export const languageColors: Record<string, string> = {
  Python: "#3572A5",
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Java: "#b07219",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  "Jupyter Notebook": "#DA5B0B",
  Go: "#00ADD8",
  Rust: "#dea584",
  SQL: "#e38c00",
};
