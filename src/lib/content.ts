import { frontmatter } from "../../PORTFOLIO.md";

export type Lang = "pt" | "en";
export const langs: Lang[] = ["pt", "en"];

type Entry = { period: string; title: string; org: string; description: string; tags: string[] };
type ProjectText = { title: string; tagline: string; description: string; imageAlt: string };
type LangContent = {
  role: string;
  headline: string;
  lede: string;
  summary: string;
  about: string;
  focus: string;
  highlights: { title: string; description: string }[];
  languages: string[];
  skillGroups: { title: string; items: string[] }[];
  experience: Entry[];
  education: Entry[];
  projects: Record<string, ProjectText>;
};
type ProjectMeta = {
  slug: string;
  year: string;
  repo: string;
  image: string;
  demo?: string;
  tags: string[];
};
type Portfolio = {
  profile: {
    name: string;
    email: string;
    site: string;
    resume: string;
    github: string;
    githubUser: string;
    linkedin: string;
    linkedinHandle: string;
    medium: string;
    mediumUser: string;
  };
  pt: LangContent;
  en: LangContent;
  projects: ProjectMeta[];
};

const data = frontmatter as Portfolio;

export const profile = data.profile;
export const content = (lang: Lang) => data[lang];

export type Project = ProjectMeta & ProjectText;
export const projects = (lang: Lang): Project[] =>
  data.projects.map((meta) => ({ ...meta, ...data[lang].projects[meta.slug]! }));

export type PageKey = "home" | "projects" | "blog" | "experience" | "contact";

const paths: Record<Lang, Record<PageKey, string>> = {
  pt: { home: "/", projects: "/projetos", blog: "/blog", experience: "/experiencia", contact: "/contato" },
  en: {
    home: "/en",
    projects: "/en/projects",
    blog: "/en/blog",
    experience: "/en/experience",
    contact: "/en/contact",
  },
};

export const pathFor = (lang: Lang, page: PageKey) => paths[lang][page];
export const projectPath = (lang: Lang, slug: string) => `${paths[lang].projects}/${slug}`;

export const ui = {
  pt: {
    nav: { home: "Início", projects: "Projetos", blog: "Blog", experience: "Experiência", contact: "Contato" },
    menu: "Menu",
    close: "Fechar",
    switchLang: "Switch to English",
    skip: "Pular para o conteúdo",
    selected: "Projetos selecionados",
    allProjects: "Todos os projetos",
    repos: "No GitHub",
    articles: "Escritos recentes",
    allArticles: "Todos os artigos",
    experience: "Trabalho",
    education: "Formação",
    skills: "Stack",
    languages: "Idiomas",
    contactTitle: "Vamos conversar",
    resume: "Baixar currículo",
    code: "Código",
    demo: "Demo",
    next: "Próximo projeto",
    minRead: "min de leitura",
    noArticles: "Os artigos não carregaram agora. Leia direto no",
    otherLangArticles: "Ainda não há artigos em português. Leia os artigos em inglês",
    noReadme: "O README deste projeto não carregou agora. Veja direto no",
    rights: "Todos os direitos reservados.",
    backToTop: "Voltar ao topo",
  },
  en: {
    nav: { home: "Home", projects: "Projects", blog: "Blog", experience: "Experience", contact: "Contact" },
    menu: "Menu",
    close: "Close",
    switchLang: "Mudar para português",
    skip: "Skip to content",
    selected: "Selected work",
    allProjects: "All projects",
    repos: "On GitHub",
    articles: "Recent writing",
    allArticles: "All articles",
    experience: "Work",
    education: "Education",
    skills: "Stack",
    languages: "Languages",
    contactTitle: "Let's talk",
    resume: "Download resume",
    code: "Code",
    demo: "Demo",
    next: "Next project",
    minRead: "min read",
    noArticles: "The articles didn't load right now. Read them on",
    otherLangArticles: "No articles in English yet. Read the ones in Portuguese",
    noReadme: "This project's README didn't load right now. See it on",
    rights: "All rights reserved.",
    backToTop: "Back to top",
  },
} satisfies Record<Lang, unknown>;
