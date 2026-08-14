import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Lang = "pt" | "en";

const STORAGE_KEY = "portfolio-lang";

export const strings = {
  pt: {
    nav: {
      inicio: "Início",
      sobre: "Sobre",
      skills: "Skills",
      experiencia: "Experiência",
      projetos: "Projetos",
      artigos: "Artigos",
      contato: "Contato",
    },
    header: {
      mainNav: "Navegação principal",
      mobileNav: "Navegação mobile",
      openMenu: "Abrir menu",
      switchToEnglish: "Switch to English",
      switchToPortuguese: "Mudar para português",
    },
    hero: { projects: "Ver projetos", resume: "Baixar currículo" },
    about: {
      eyebrow: "Sobre",
      title: "Quem sou eu",
      extra:
        "Participo de pesquisas em Inteligência Artificial e gosto de levar modelos do papel para o mundo real: rodando localmente, com dados privados, boa performance e uma interface que qualquer pessoa consiga usar.",
      languages: "Idiomas",
      highlights: [
        {
          title: "IA aplicada",
          description:
            "LLMs locais, visão computacional e OCR levados a produção com foco em privacidade e desempenho.",
        },
        {
          title: "Engenharia de dados",
          description:
            "Pipelines assíncronos, modelagem e automações que transformam dados brutos em decisão.",
        },
        {
          title: "Produto ponta a ponta",
          description:
            "Do experimento à interface: aplicações web full-stack pensadas para quem usa, não só para quem programa.",
        },
      ],
      currently: "Foco total",
      currentlyText:
        "Pesquisa em IA generativa aplicada, inferência local de modelos e engenharia de dados.",
    },
    skills: {
      eyebrow: "Skills",
      title: "Conhecimento técnico",
      description: "Stack que uso no dia a dia entre IA, dados e desenvolvimento web.",
    },
    career: {
      eyebrow: "Carreira",
      title: "Experiência e formação",
      description: "Onde trabalhei, o que construí e o que estou estudando.",
    },
    projects: {
      eyebrow: "Projetos",
      title: "Projetos relevantes",
      description: "Soluções de IA local, pipelines de dados e aplicações web.",
      pinnedTitle: "Repositórios fixados",
      pinnedDescription: "Carregados automaticamente do meu perfil no GitHub.",
      code: "Código",
      demo: "Demo",
      error: "Não consegui carregar os projetos agora. Você pode vê-los direto no",
      errorLink: "meu GitHub",
    },
    articles: {
      eyebrow: "Medium",
      title: "Artigos",
      description: "Os textos mais recentes publicados no meu Medium.",
      read: "Ler no Medium",
      cover: (title: string) => `Capa do artigo ${title}`,
      error: "Não consegui carregar os artigos agora. Você pode lê-los direto no",
      errorLink: "meu Medium",
    },
    contact: {
      eyebrow: "Contato",
      title: "Vamos conversar",
      description:
        "Aberto a oportunidades, colaborações e trocas sobre IA, dados e desenvolvimento.",
      email: "E-mail",
      phone: "Telefone",
      name: "Seu nome",
      subject: "Assunto",
      message: "Mensagem",
      send: "Enviar e-mail",
      hint: "O botão abre seu cliente de e-mail com a mensagem pronta.",
      defaultSubject: (name: string) => `Contato pelo site — ${name}`,
    },
    footer: "Feito com React e muito café.",
  },
  en: {
    nav: {
      inicio: "Home",
      sobre: "About",
      skills: "Skills",
      experiencia: "Experience",
      projetos: "Projects",
      artigos: "Articles",
      contato: "Contact",
    },
    header: {
      mainNav: "Main navigation",
      mobileNav: "Mobile navigation",
      openMenu: "Open menu",
      switchToEnglish: "Switch to English",
      switchToPortuguese: "Mudar para português",
    },
    hero: { projects: "See projects", resume: "Download resume" },
    about: {
      eyebrow: "About",
      title: "Who I am",
      extra:
        "I take part in Artificial Intelligence research and love moving models from paper to the real world: running locally, with private data, solid performance and an interface anyone can use.",
      languages: "Languages",
      highlights: [
        {
          title: "Applied AI",
          description:
            "Local LLMs, computer vision and OCR shipped to production with privacy and performance in mind.",
        },
        {
          title: "Data engineering",
          description:
            "Async pipelines, modeling and automation that turn raw data into decisions.",
        },
        {
          title: "End-to-end product",
          description:
            "From experiment to interface: full-stack web apps built for the people who use them.",
        },
      ],
      currently: "Total focus",
      currentlyText:
        "Research on applied generative AI, local model inference and data engineering.",
    },
    skills: {
      eyebrow: "Skills",
      title: "Technical background",
      description: "The stack I use daily across AI, data and web development.",
    },
    career: {
      eyebrow: "Career",
      title: "Experience and education",
      description: "Where I worked, what I built and what I'm studying.",
    },
    projects: {
      eyebrow: "Projects",
      title: "Featured projects",
      description: "Local AI solutions, data pipelines and web applications.",
      pinnedTitle: "Pinned repositories",
      pinnedDescription: "Loaded automatically from my GitHub profile.",
      code: "Code",
      demo: "Demo",
      error: "I couldn't load the projects right now. You can browse them on",
      errorLink: "my GitHub",
    },
    articles: {
      eyebrow: "Medium",
      title: "Articles",
      description: "The latest posts published on my Medium.",
      read: "Read on Medium",
      cover: (title: string) => `Cover of the article ${title}`,
      error: "I couldn't load the articles right now. You can read them on",
      errorLink: "my Medium",
    },
    contact: {
      eyebrow: "Contact",
      title: "Let's talk",
      description: "Open to opportunities, collaborations and chats about AI, data and development.",
      email: "Email",
      phone: "Phone",
      name: "Your name",
      subject: "Subject",
      message: "Message",
      send: "Send email",
      hint: "The button opens your email client with the message ready.",
      defaultSubject: (name: string) => `Contact from the website — ${name}`,
    },
    footer: "Built with React and a lot of coffee.",
  },
} as const;

type I18nValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (typeof strings)["pt"];
};

const I18nContext = createContext<I18nValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("pt");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "pt" || stored === "en") setLang(stored);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang === "pt" ? "pt-BR" : "en";
  }, [lang]);

  const value = useMemo<I18nValue>(
    () => ({
      lang,
      setLang,
      toggleLang: () => setLang((current) => (current === "pt" ? "en" : "pt")),
      t: strings[lang] as (typeof strings)["pt"],
    }),
    [lang],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside LanguageProvider");
  return context;
}
