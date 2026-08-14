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
} from "lucide-react";
import { useState } from "react";

import { ArticlesGrid } from "@/components/articles-grid";
import { ProjectsGrid } from "@/components/projects-grid";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { useI18n } from "@/lib/i18n";
import { getSkillConfig } from "@/lib/skill-icons";
import { contentByLang, profile, type SkillIcon, type TimelineEntry } from "@/lib/site-data";

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
    links: [
      { rel: "preconnect", href: "https://pinned.berrysauce.dev", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://api.rss2json.com", crossOrigin: "anonymous" },
      { rel: "dns-prefetch", href: "https://api.github.com" },
    ],
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

function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <ol className="relative mt-8 border-l border-border pl-6">
      {entries.map((entry) => (
        <li key={`${entry.title}-${entry.period}`} className="pb-10 last:pb-0">
          <Reveal>
            <span className="absolute -left-[7px] mt-2 size-3 rounded-full bg-primary" aria-hidden />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">{entry.period}</span>
            <h3 className="mt-2 text-xl font-semibold">{entry.title}</h3>
            <p className="text-sm text-muted-foreground">{entry.org}</p>
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{entry.description}</p>
            {entry.tags ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <li key={tag} className="glass rounded-full px-3 py-1 font-mono text-[11px]">
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
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
      className="glass-liquid rounded-3xl p-6"
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
    <div>
      <section id="inicio">
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-32 sm:pb-28 sm:pt-40 lg:pb-32 lg:pt-44">
          <Reveal>
            <span className="glass inline-flex rounded-full px-4 py-1.5 font-mono text-xs uppercase tracking-[0.25em] text-primary">
              {content.location}
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
              {profile.name} — <span className="text-primary">{content.role}</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{content.headline}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#projetos"
                className="glass-pill inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
              >
                {t.hero.projects} <ArrowRight className="size-4" aria-hidden />
              </a>
              <a
                href={profile.resume}
                download
                className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium"
              >
                <Download className="size-4 text-sky-400" aria-hidden /> {t.hero.resume}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="sobre" className="mx-auto max-w-6xl px-5 py-16 sm:py-20 lg:py-24">
        <SectionHeading eyebrow={t.about.eyebrow} title={t.about.title} />
        <div className="mt-8 grid gap-5 sm:mt-10 lg:grid-cols-[1.6fr_1fr]">
          <Reveal>
            <div className="glass-liquid relative h-full overflow-hidden rounded-3xl p-6 sm:p-8">
              <span
                className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-primary/20 blur-3xl"
                aria-hidden
              />
              <p className="text-base leading-relaxed text-foreground/90 sm:text-lg">
                {content.summary}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {t.about.extra}
              </p>
              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {t.about.highlights.map((item) => {
                  const { icon: Icon, colorClass, bgClass } = highlightMeta(item.title);
                  return (
                    <div key={item.title} className="glass-pill rounded-2xl p-4 transition-transform hover:scale-[1.02]">
                      <span className={`mb-2 inline-flex size-8 items-center justify-center rounded-xl ${bgClass} ${colorClass}`}>
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <h3 className="text-sm font-semibold">{item.title}</h3>
                      <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="flex h-full flex-col gap-5">
              <div className="glass-liquid card-glow rounded-3xl p-6 sm:p-7">
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Sparkles className="size-4" aria-hidden />
                  </span>
                  <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                    {t.about.currently}
                  </h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-foreground/90">
                  {t.about.currentlyText}
                </p>
              </div>
              <div className="glass-liquid card-glow flex flex-col justify-center rounded-3xl p-6 sm:p-7">
                <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                  {t.about.languages}
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {content.languages.map((language) => (
                    <span 
                      key={language} 
                      className="glass-pill inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium text-foreground/90 transition-colors hover:text-primary"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="skills" className="mx-auto max-w-6xl px-5 py-16 sm:py-20 lg:py-24">
        <SectionHeading
          eyebrow={t.skills.eyebrow}
          title={t.skills.title}
          description={t.skills.description}
        />
        <div className="mt-8 grid gap-5 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
          {content.skillGroups.map((group, groupIdx) => {
            const { icon: Icon, colorClass, bgClass } = skillGroupMeta[group.icon];
            return (
              <Reveal key={group.title} delay={groupIdx * 0.1}>
                <div className="glass-liquid card-glow group relative h-full overflow-hidden rounded-3xl p-6">
                  <span
                    className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full bg-primary/15 blur-2xl sm:opacity-60"
                    aria-hidden
                  />
                  <span className={`inline-flex size-11 items-center justify-center rounded-2xl ${bgClass} ${colorClass}`}>
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-base font-semibold">{group.title}</h3>
                  <div className="mt-3 h-px w-full bg-gradient-to-r from-primary/50 to-transparent" />
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {group.items.map((item) => {
                      const { icon: ItemIcon, iconClass, chipClass } = getSkillConfig(item);
                      return (
                        <li
                          key={item}
                          className={`inline-flex items-center gap-1.5 rounded-full border border-border/70 ${chipClass} px-2.5 py-1 font-mono text-[11px] text-muted-foreground`}
                        >
                          <ItemIcon className={`size-3.5 ${iconClass}`} aria-hidden />
                          {item}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      <section id="experiencia" className="mx-auto max-w-6xl px-5 py-16 sm:py-20 lg:py-24">
        <SectionHeading
          eyebrow={t.career.eyebrow}
          title={t.career.title}
          description={t.career.description}
        />
        <div className="mt-8 grid gap-10 sm:mt-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <Timeline entries={content.experience} />
          </div>
          <div>
            <Timeline entries={content.education} />
          </div>
        </div>
      </section>

      <section id="projetos" className="mx-auto max-w-6xl px-5 py-16 sm:py-20 lg:py-24">
        <SectionHeading
          eyebrow={t.projects.eyebrow}
          title={t.projects.title}
          description={t.projects.description}
        />
        <div className="mt-8 grid gap-5 sm:mt-10 md:grid-cols-2">
          {content.featuredProjects.map((project, projectIdx) => (
            <Reveal key={project.name} delay={projectIdx * 0.1}>
              <a
                href={project.url}
                target="_blank"
                rel="noreferrer"
                className="glass-liquid card-glow flex h-full flex-col rounded-3xl p-6"
              >
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
                  {project.year}
                </span>
                <h3 className="mt-3 text-xl font-semibold">{project.title}</h3>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{project.description}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <li key={tag} className="glass-pill rounded-full px-3 py-1 font-mono text-[11px]">
                      {tag}
                    </li>
                  ))}
                </ul>
              </a>
            </Reveal>
          ))}
        </div>

        <div className="mt-14 sm:mt-16">
          <SectionHeading
            eyebrow="GitHub"
            title={t.projects.pinnedTitle}
            description={t.projects.pinnedDescription}
          />
          <div className="mt-10">
            <ProjectsGrid limit={6} />
          </div>
        </div>
      </section>

      <section id="artigos" className="mx-auto max-w-6xl px-5 py-16 sm:py-20 lg:py-24">
        <SectionHeading
          eyebrow={t.articles.eyebrow}
          title={t.articles.title}
          description={t.articles.description}
        />
        <div className="mt-10">
          <ArticlesGrid limit={6} />
        </div>
      </section>

      <section id="contato" className="mx-auto max-w-6xl px-5 py-16 sm:py-20 lg:py-24">
        <SectionHeading
          eyebrow={t.contact.eyebrow}
          title={t.contact.title}
          description={t.contact.description}
        />
        <div className="mt-8 grid gap-5 sm:mt-10 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <ul className="space-y-3">
              {channels.map(({ label, value, href, icon: Icon, colorClass, bgClass }, channelIdx) => (
                <li key={label}>
                  <Reveal delay={channelIdx * 0.1}>
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel="noreferrer"
                    className="glass-liquid card-glow flex items-center gap-4 rounded-2xl p-4"
                  >
                    <span className={`inline-flex size-10 items-center justify-center rounded-full ${bgClass} ${colorClass}`}>
                      <Icon className="size-4" aria-hidden />
                    </span>
                    <span>
                      <span className="block text-sm font-medium">{label}</span>
                      <span className="block text-sm text-muted-foreground">{value}</span>
                    </span>
                  </a>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
          <Reveal>
            <ContactForm />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
