import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, Download } from "lucide-react";
import { useState } from "react";

import { ArticlesGrid } from "../components/articles-grid";
import { FeaturedProjectCard } from "../components/featured-project-card";
import { ProjectsGrid } from "../components/projects-grid";
import { Reveal } from "../components/reveal";
import { SectionHeading } from "../components/section-heading";
import { useI18n } from "../lib/i18n";
import { contentByLang, profile, type TimelineEntry } from "../lib/site-data";

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

const sectionClass = "mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20";
const labelClass = "text-caption font-semibold uppercase tracking-[0.06em] text-muted-foreground";

function Timeline({ title, entries }: { title: string; entries: TimelineEntry[] }) {
  return (
    <div>
      <h3 className={labelClass}>{title}</h3>
      <ol className="mt-4">
        {entries.map((entry) => (
          <li
            key={`${entry.title}-${entry.period}`}
            className="border-t border-border py-7 first:border-t-0 first:pt-3"
          >
            <p className="text-caption tabular-nums text-muted-foreground">{entry.period}</p>
            <h4 className="text-headline mt-1.5">{entry.title}</h4>
            <p className="mt-0.5 text-muted-foreground">{entry.org}</p>
            <p className="mt-3 max-w-xl text-[0.9375rem] leading-relaxed text-foreground/80">
              {entry.description}
            </p>
            {entry.tags ? (
              <p className="text-caption mt-4 text-muted-foreground">{entry.tags.join(" · ")}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

const fieldClass =
  "w-full rounded-xl bg-input px-4 py-3 text-base text-foreground outline-none ring-1 ring-transparent transition-[box-shadow,background-color] duration-200 focus:bg-transparent focus:ring-2 focus:ring-ring";

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
      className="surface-card p-6 sm:p-8"
      onSubmit={(event) => {
        event.preventDefault();
        window.location.href = mailto;
      }}
    >
      <div className="grid gap-5">
        <label className="block">
          <span className="text-caption mb-2 block font-medium text-muted-foreground">
            {t.contact.name}
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            autoComplete="name"
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="text-caption mb-2 block font-medium text-muted-foreground">
            {t.contact.subject}
          </span>
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className="block">
          <span className="text-caption mb-2 block font-medium text-muted-foreground">
            {t.contact.message}
          </span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
            rows={5}
            className={`${fieldClass} resize-none`}
          />
        </label>
        <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-3">
          <button type="submit" className="btn-primary pressable">
            {t.contact.send}
          </button>
          <p className="text-caption max-w-xs text-muted-foreground">{t.contact.hint}</p>
        </div>
      </div>
    </form>
  );
}

function Home() {
  const { lang, t } = useI18n();
  const content = contentByLang[lang];

  const channels = [
    { label: t.contact.email, value: profile.email, href: `mailto:${profile.email}` },
    { label: "LinkedIn", value: "/in/diegomirhan", href: profile.linkedin },
    { label: "GitHub", value: `@${profile.githubUser}`, href: profile.github },
    { label: "Medium", value: profile.mediumUser, href: profile.medium },
  ];

  return (
    <div className="relative">
      <section id="inicio">
        <div className="mx-auto max-w-5xl px-5 pb-10 pt-36 sm:px-8 sm:pb-14 sm:pt-44">
          <Reveal>
            <h1 className="text-display">
              {profile.name}.<span className="block text-muted-foreground">{content.role}.</span>
            </h1>
            <p className="text-lede mt-8 max-w-2xl text-foreground/80">{content.headline}</p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <a href="#projetos" className="btn-primary pressable">
                {t.hero.projects}
                <ArrowRight className="size-[18px]" aria-hidden />
              </a>
              <a href={profile.resume} download className="btn-secondary pressable">
                <Download className="size-[18px]" aria-hidden />
                {t.hero.resume}
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <section id="sobre" className={sectionClass}>
        <SectionHeading eyebrow={t.about.eyebrow} title={t.about.title} />
        <Reveal className="mt-10 grid gap-4 lg:grid-cols-[1.55fr_1fr]">
          <div className="surface-card p-7 sm:p-10">
            <p className="text-lede text-foreground">{content.summary}</p>
            <p className="mt-5 leading-relaxed text-muted-foreground">{t.about.extra}</p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="surface-card flex-1 p-7 sm:p-8">
              <h3 className={labelClass}>{t.about.currently}</h3>
              <p className="text-headline mt-3 font-medium">{t.about.currentlyText}</p>
            </div>
            <div className="surface-card p-7 sm:p-8">
              <h3 className={labelClass}>{t.about.languages}</h3>
              <ul className="mt-3 space-y-1.5">
                {content.languages.map((language) => (
                  <li key={language}>{language}</li>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
        <Reveal className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {t.about.highlights.map((item) => (
            <div key={item.title} className="border-t border-border pt-6">
              <h3 className="text-headline">{item.title}</h3>
              <p className="mt-2 leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </Reveal>
      </section>

      <section id="skills" className={sectionClass}>
        <SectionHeading
          eyebrow={t.skills.eyebrow}
          title={t.skills.title}
          description={t.skills.description}
        />
        <Reveal className="mt-10 grid gap-4 md:grid-cols-2">
          {content.skillGroups.map((group) => (
            <div key={group.title} className="surface-card p-7 sm:p-8">
              <h3 className="text-headline">{group.title}</h3>
              <ul className="mt-5 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li key={item} className="chip">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </Reveal>
      </section>

      <section id="experiencia" className={sectionClass}>
        <SectionHeading
          eyebrow={t.career.eyebrow}
          title={t.career.title}
          description={t.career.description}
        />
        <Reveal className="mt-10 grid gap-12 lg:grid-cols-2 lg:gap-16">
          <Timeline
            title={lang === "pt" ? "Experiência profissional" : "Professional experience"}
            entries={content.experience}
          />
          <Timeline
            title={lang === "pt" ? "Formação acadêmica" : "Education"}
            entries={content.education}
          />
        </Reveal>
      </section>

      <section id="projetos" className={sectionClass}>
        <SectionHeading
          eyebrow={t.projects.eyebrow}
          title={t.projects.title}
          description={t.projects.description}
        />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {content.featuredProjects.map((project, index, all) => {
            const wide = index === 0 || (index === all.length - 1 && all.length % 2 === 0);
            return (
              <Reveal key={project.name} className={wide ? "md:col-span-2" : ""}>
                <FeaturedProjectCard project={project} wide={wide} />
              </Reveal>
            );
          })}
        </div>

        <div className="mt-20">
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

      <section id="artigos" className={sectionClass}>
        <SectionHeading
          eyebrow={t.articles.eyebrow}
          title={t.articles.title}
          description={t.articles.description}
        />
        <div className="mt-10">
          <ArticlesGrid limit={6} />
        </div>
      </section>

      <section id="contato" className={sectionClass}>
        <SectionHeading
          eyebrow={t.contact.eyebrow}
          title={t.contact.title}
          description={t.contact.description}
        />
        <Reveal className="mt-10 grid items-start gap-4 lg:grid-cols-[1fr_1.25fr]">
          <ul className="surface-card p-2">
            {channels.map(({ label, value, href }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="group flex items-center justify-between gap-4 rounded-[1.25rem] px-5 py-4 transition-colors duration-200 hover:bg-foreground/[0.05] active:bg-foreground/[0.09]"
                >
                  <span className="min-w-0">
                    <span className="block font-medium">{label}</span>
                    <span className="block truncate text-[0.9375rem] text-muted-foreground">
                      {value}
                    </span>
                  </span>
                  <ArrowUpRight
                    className="size-[18px] shrink-0 text-muted-foreground transition-[translate,color] duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                    aria-hidden
                  />
                </a>
              </li>
            ))}
          </ul>
          <ContactForm />
        </Reveal>
      </section>
    </div>
  );
}
