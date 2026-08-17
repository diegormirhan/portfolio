import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  Brain,
  Cpu,
  Database,
  Download,
  Github,
  Layers,
  Linkedin,
  Mail,
  PenLine,
  Sparkles,
  Globe,
  Zap,
} from "lucide-react";
import { useState } from "react";


import { ArticlesGrid } from "../components/articles-grid";
import { ProjectsGrid } from "../components/projects-grid";
import { Reveal } from "../components/reveal";
import { SectionHeading } from "../components/section-heading";
import { Background } from "../components/background";
import { useI18n } from "../lib/i18n";
import { getSkillConfig } from "../lib/skill-icons";
import { contentByLang, profile, type SkillIcon, type TimelineEntry } from "../lib/site-data";

const skillGroupMeta: Record<
  SkillIcon,
  { icon: typeof Brain; colorClass: string; bgClass: string }
> = {
  ai: { icon: Brain, colorClass: "text-violet-400", bgClass: "bg-violet-400/10" },
  code: { icon: Cpu, colorClass: "text-blue-400", bgClass: "bg-blue-400/10" },
  web: { icon: Layers, colorClass: "text-cyan-400", bgClass: "bg-cyan-400/10" },
  infra: { icon: Database, colorClass: "text-amber-400", bgClass: "bg-amber-400/10" },
};

function highlightMeta(title: string) {
  switch (title) {
    case "IA aplicada":
    case "Applied AI":
      return { icon: Brain, colorClass: "text-violet-400", bgClass: "bg-violet-400/10" };
    case "Engenharia de dados":
    case "Data engineering":
      return { icon: Database, colorClass: "text-blue-400", bgClass: "bg-blue-400/10" };
    case "Produto ponta a ponta":
    case "End-to-end product":
      return { icon: Layers, colorClass: "text-emerald-400", bgClass: "bg-emerald-400/10" };
    default:
      return { icon: Sparkles, colorClass: "text-primary", bgClass: "bg-primary/10" };
  }
}

export const Route = createFileRoute("/")({
  head: () => ({
    links: [],
    meta: [
      { title: `${profile.name} — ${profile.role}` },
      { name: "description", content: profile.summary.slice(0, 155) },
      { property: "og:title", content: `${profile.name} — ${profile.role}` },
      { property: "og:description", content: profile.summary.slice(0, 155) },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Person",
          name: profile.name,
          jobTitle: profile.role,
          url: profile.site,
          email: `mailto:${profile.email}`,
          sameAs: [profile.github, profile.linkedin, profile.medium],
        }),
      },
    ],
  }),
  component: Home,
});

function Timeline({ entries, icon: Icon = Sparkles }: { entries: TimelineEntry[], icon?: any }) {
  return (
    <ol className="relative mt-12 space-y-12 border-l-2 border-border ml-6 pl-10">
      {entries.map((entry, idx) => (
        <li key={`${entry.title}-${entry.period}`} className="relative">
          <Reveal delay={idx * 0.1}>
            <div className="absolute -left-[51px] top-0 flex size-10 items-center justify-center rounded-xl bg-card border-2 border-border text-primary shadow-sm transition-transform group-hover:scale-110">
              <Icon className="size-5" aria-hidden />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/80">{entry.period}</span>
              <h3 className="text-xl font-bold tracking-tight">{entry.title}</h3>
              <p className="font-medium text-primary/90">{entry.org}</p>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{entry.description}</p>
              {entry.tags ? (
                <ul className="mt-5 flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <li key={tag} className="inline-flex items-center rounded-md border border-border bg-surface/50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </Reveal>
        </li>
      ))}
    </ol>
  );
}

function ContactForm() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const mailto = `mailto:${profile.email}?subject=${encodeURIComponent(
    subject || t.contact.defaultSubject(name),
  )}&body=${encodeURIComponent(`${message}\n\n— ${name}`)}`;

  return (
    <form
      className="card-modern rounded-2xl p-6 sm:p-8"
      onSubmit={(event) => {
        event.preventDefault();
        window.location.href = mailto;
      }}
    >
      <div className="grid gap-4">
        <label className="text-sm">
          <span className="mb-1.5 block text-muted-foreground">{t.contact.name}</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            className="w-full rounded-lg border border-input bg-background/60 px-3 py-2 outline-none focus:border-primary"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-muted-foreground">{t.contact.subject}</span>
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="w-full rounded-lg border border-input bg-background/60 px-3 py-2 outline-none focus:border-primary"
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-muted-foreground">{t.contact.message}</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
            rows={5}
            className="w-full rounded-lg border border-input bg-background/60 px-3 py-2 outline-none focus:border-primary"
          />
        </label>
        <button
          type="submit"
          className="glass-pill mt-2 inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium"
        >
          {t.contact.send}
        </button>
        <p className="text-xs text-muted-foreground">{t.contact.hint}</p>
      </div>
    </form>
  );
}

function Home() {
  const { lang, t } = useI18n();
  const content = contentByLang[lang];

  const channels = [
    {
      label: t.contact.email,
      value: profile.email,
      href: `mailto:${profile.email}`,
      icon: Mail,
      colorClass: "text-red-400",
      bgClass: "bg-red-400/10",
    },
    {
      label: "LinkedIn",
      value: "/in/diegomirhan",
      href: profile.linkedin,
      icon: Linkedin,
      colorClass: "text-blue-500",
      bgClass: "bg-blue-500/10",
    },
    {
      label: "GitHub",
      value: `@${profile.githubUser}`,
      href: profile.github,
      icon: Github,
      colorClass: "text-slate-300",
      bgClass: "bg-slate-300/10",
    },
    {
      label: "Medium",
      value: profile.mediumUser,
      href: profile.medium,
      icon: PenLine,
      colorClass: "text-green-500",
      bgClass: "bg-green-500/10",
    },
  ];

  return (
    <div className="relative">
      <Background />
      
      {/* Macrostructure: Marquee Hero */}
      <section id="inicio" className="hero-marquee border-b-[1.5px] border-ink">
        <Reveal>
          <div className="num-label mb-12 bg-ink text-paper inline-block px-3 py-1 rotate-[-2deg]">01 — Início</div>
          <h1 className="display-xxl uppercase italic">
            {profile.name}
          </h1>
          <p className="hero-marquee__sub font-bold text-ink">
            {content.headline}
          </p>
          <div className="mt-12 flex flex-wrap gap-6">
            <a
              href="#projetos"
              className="inline-flex items-center gap-2 border-b-2 border-primary pb-1 text-sm font-bold tracking-tight hover:text-primary transition-all"
            >
              {t.hero.projects} <ArrowRight className="size-4" />
            </a>
            <a
              href={profile.resume}
              download
              className="inline-flex items-center gap-2 border-b-2 border-rule pb-1 text-sm font-bold tracking-tight hover:border-primary transition-all"
            >
              <Download className="size-4 text-primary" /> {t.hero.resume}
            </a>
          </div>
        </Reveal>
      </section>

      {/* S1 Left-margin numbered sections */}
      <section id="sobre" className="mx-auto max-w-6xl px-5">
        <Reveal>
          <header className="head-margin">
            <p className="num-label">02 — Sobre</p>
            <div>
              <h2 className="text-display-s uppercase italic leading-none">{t.about.title}</h2>
              <div className="mt-12 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
                <div className="space-y-6">
                  <p className="text-xl leading-relaxed font-medium">
                    {content.summary}
                  </p>
                  <p className="text-muted-foreground">
                    {t.about.extra}
                  </p>
                  
                  <div className="grid gap-6 pt-8 sm:grid-cols-3">
                    {t.about.highlights.map((item) => {
                      const { icon: Icon } = highlightMeta(item.title);
                      return (
                        <div key={item.title} className="group">
                          <Icon className="size-5 mb-3 text-primary" />
                          <h3 className="text-sm font-bold uppercase tracking-tight mb-2">{item.title}</h3>
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {item.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-12">
                  <div>
                    <h3 className="num-label mb-4">{t.about.currently}</h3>
                    <p className="text-lg font-medium">{t.about.currentlyText}</p>
                  </div>
                  <div>
                    <h3 className="num-label mb-4">{t.about.languages}</h3>
                    <div className="flex flex-wrap gap-2">
                      {content.languages.map((language) => (
                        <span key={language} className="tag-monochrome">{language}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>
        </Reveal>
      </section>

      <section id="skills" className="mx-auto max-w-6xl px-5">
        <Reveal>
          <header className="head-margin">
            <p className="num-label">03 — Skills</p>
            <div>
              <h2 className="text-display-s uppercase italic leading-none">{t.skills.title}</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl">{t.skills.description}</p>
              
              <div className="mt-12 grid gap-8 md:grid-cols-2">
                {content.skillGroups.map((group) => {
                  const { icon: Icon } = skillGroupMeta[group.icon];
                  return (
                    <div key={group.title} className="portfolio-card">
                      <div className="flex items-center gap-3 mb-6">
                        <Icon className="size-6 text-primary" />
                        <h3 className="text-xl font-bold">{group.title}</h3>
                      </div>
                      <ul className="flex flex-wrap gap-2">
                        {group.items.map((item) => (
                          <li key={item} className="tag-monochrome">
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          </header>
        </Reveal>
      </section>

      <section id="experiencia" className="mx-auto max-w-6xl px-5">
        <Reveal>
          <header className="head-margin">
            <p className="num-label">04 — Carreira</p>
            <div>
              <h2 className="text-display-s uppercase italic leading-none">{t.career.title}</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl">{t.career.description}</p>

              <div className="mt-16 grid gap-16 lg:grid-cols-2">
                <div>
                  <h3 className="num-label mb-8">Experiência Profissional</h3>
                  <div className="space-y-12 border-l border-rule ml-4 sm:ml-0 pl-8 sm:pl-8">
                    {content.experience.map((exp) => (
                      <div key={exp.title} className="relative">
                        <div className="absolute -left-[37px] sm:-left-[33px] top-1.5 size-2 rounded-full bg-primary" />
                        <span className="num-label block mb-2">{exp.period}</span>
                        <h4 className="text-xl font-bold mb-1">{exp.title}</h4>
                        <p className="text-primary font-bold text-sm mb-4">{exp.org}</p>
                        <p className="text-muted-foreground text-sm leading-relaxed">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="num-label mb-8">Formação Acadêmica</h3>
                  <div className="space-y-12 border-l border-rule ml-4 sm:ml-0 pl-8 sm:pl-8">
                    {content.education.map((edu) => (
                      <div key={edu.title} className="relative">
                        <div className="absolute -left-[37px] sm:-left-[33px] top-1.5 size-2 rounded-full bg-primary" />
                        <span className="num-label block mb-2">{edu.period}</span>
                        <h4 className="text-xl font-bold mb-1">{edu.title}</h4>
                        <p className="text-primary font-bold text-sm mb-4">{edu.org}</p>
                        <p className="text-muted-foreground text-sm leading-relaxed">{edu.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </header>
        </Reveal>
      </section>

      <section id="projetos" className="mx-auto max-w-6xl px-5">
        <Reveal>
          <header className="head-margin">
            <p className="num-label">05 — Projetos</p>
            <div>
              <h2 className="text-display-s uppercase italic leading-none">{t.projects.title}</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl">{t.projects.description}</p>
              
              <div className="mt-12 grid-portfolio">
                {content.featuredProjects.map((project) => (
                  <a key={project.name} href={project.url} target="_blank" rel="noreferrer" className="portfolio-card">
                    <span className="portfolio-card__meta">{project.year}</span>
                    <h3 className="portfolio-card__title font-bold leading-tight">{project.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-6">{project.description}</p>
                    <div className="portfolio-card__tags">
                      {project.tags.map(tag => (
                        <span key={tag} className="tag-monochrome">{tag}</span>
                      ))}
                    </div>
                  </a>
                ))}
              </div>

              <div className="mt-20">
                <h3 className="num-label mb-8">{t.projects.pinnedTitle}</h3>
                <ProjectsGrid />
              </div>
            </div>
          </header>
        </Reveal>
      </section>

      <section id="artigos" className="mx-auto max-w-6xl px-5">
        <Reveal>
          <header className="head-margin">
            <p className="num-label">06 — Artigos</p>
            <div>
              <h2 className="text-display-s uppercase italic leading-none">{t.articles.title}</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl">{t.articles.description}</p>
              <div className="mt-12">
                <ArticlesGrid />
              </div>
            </div>
          </header>
        </Reveal>
      </section>

      <section id="contato" className="mx-auto max-w-6xl px-5 pb-32">
        <Reveal>
          <header className="head-margin">
            <p className="num-label">07 — Contato</p>
            <div>
              <h2 className="text-display-s uppercase italic leading-none">{t.contact.title}</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mb-12">{t.contact.description}</p>
              
              <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
                <div className="space-y-8">
                  {channels.map((chan) => (
                    <a key={chan.label} href={chan.href} className="group block">
                      <span className="num-label group-hover:text-primary transition-colors">{chan.label}</span>
                      <span className="block text-xl font-bold mt-1 group-hover:translate-x-1 transition-transform inline-flex items-center gap-2">
                        {chan.value} <ArrowRight className="size-4" />
                      </span>
                    </a>
                  ))}
                </div>
                <ContactForm />
              </div>
            </div>
          </header>
        </Reveal>
      </section>

      {/* Ft5 · Statement Footer */}
      <footer className="foot-stmt">
        <Reveal>
          <div className="flex flex-col gap-12">
            <p className="foot-stmt__line">
              Building local AI for the real world.
            </p>
            <div className="foot-stmt__meta">
              <p>© {new Date().getFullYear()} — {profile.name}</p>
              <div className="flex gap-6">
                <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Github</a>
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Linkedin</a>
              </div>
            </div>
          </div>
        </Reveal>
      </footer>
    </div>
  );
}

