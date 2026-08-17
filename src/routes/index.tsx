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
 ChevronRight,
} from "lucide-react";
import { useState } from "react";

import { ArticlesGrid } from "../components/articles-grid";
import { ProjectsGrid } from "../components/projects-grid";
import { Reveal } from "../components/reveal";
import { Background } from "../components/background";
import { useI18n } from "../lib/i18n";
import { contentByLang, profile, type SkillIcon, type TimelineEntry } from "../lib/site-data";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

const skillGroupMeta: Record<
 SkillIcon,
 { icon: typeof Brain }
> = {
 ai: { icon: Brain },
 code: { icon: Cpu },
 web: { icon: Layers },
 infra: { icon: Database },
};

function highlightMeta(title: string) {
 switch (title) {
  case "IA aplicada":
  case "Applied AI":
   return { icon: Brain };
  case "Engenharia de dados":
  case "Data engineering":
   return { icon: Database };
  case "Produto ponta a ponta":
  case "End-to-end product":
   return { icon: Layers };
  default:
   return { icon: Sparkles };
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
  <div className="relative mt-12 space-y-12 border-l border-border pl-8">
    {entries.map((entry, idx) => (
     <Reveal key={`${entry.title}-${entry.period}`} delay={idx * 0.1}>
      <div className="group relative">
       {/* Timeline Marker */}
       <div className="absolute -left-[41px] top-1 size-4 border border-primary bg-background transition-transform group-hover:scale-125 group-hover:bg-primary" />
       
       <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-primary">{entry.period}</span>
        </div>
        <h3 className="text-lg font-bold leading-tight">{entry.title}</h3>
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{entry.org}</p>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground/80 max-w-xl">{entry.description}</p>
        {entry.tags ? (
         <div className="mt-4 flex flex-wrap gap-2">
          {entry.tags.map((tag) => (
           <Badge key={tag} variant="secondary" className="font-mono text-[9px] uppercase tracking-wider bg-muted text-muted-foreground">
            {tag}
           </Badge>
          ))}
         </div>
        ) : null}
       </div>
      </div>
     </Reveal>
    ))}
  </div>
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
  <Card className="technical-card border-border/40">
   <CardHeader>
     <h3 className="text-xl font-bold">{t.contact.title}</h3>
   </CardHeader>
   <CardContent>
    <form
     className="grid gap-4"
     onSubmit={(event) => {
      event.preventDefault();
      window.location.href = mailto;
     }}
    >
     <div className="grid gap-2">
      <label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
       {t.contact.name}
      </label>
      <input
       id="name"
       value={name}
       onChange={(event) => setName(event.target.value)}
       required
       className="w-full border border-border bg-background px-4 py-2.5 outline-none focus:border-primary transition-colors"
      />
     </div>
     <div className="grid gap-2">
      <label htmlFor="subject" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
       {t.contact.subject}
      </label>
      <input
       id="subject"
       value={subject}
       onChange={(event) => setSubject(event.target.value)}
       className="w-full border border-border bg-background px-4 py-2.5 outline-none focus:border-primary transition-colors"
      />
     </div>
     <div className="grid gap-2">
      <label htmlFor="message" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
       {t.contact.message}
      </label>
      <textarea
       id="message"
       value={message}
       onChange={(event) => setMessage(event.target.value)}
       required
       rows={5}
       className="w-full border border-border bg-background px-4 py-2.5 outline-none focus:border-primary transition-colors"
      />
     </div>
     <button type="submit" className="foundry-btn mt-2">
      {t.contact.send}
     </button>
     <p className="text-center text-[10px] text-muted-foreground">{t.contact.hint}</p>
    </form>
   </CardContent>
  </Card>
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
  },
  {
   label: "LinkedIn",
   value: "/in/diegomirhan",
   href: profile.linkedin,
   icon: Linkedin,
  },
  {
   label: "GitHub",
   value: `@${profile.githubUser}`,
   href: profile.github,
   icon: Github,
  },
  {
   label: "Medium",
   value: profile.mediumUser,
   href: profile.medium,
   icon: PenLine,
  },
 ];

 return (
  <div className="relative min-h-screen">
   <Background />
   
   {/* Hero Section */}
    <section id="inicio" className="flex min-h-[90dvh] flex-col justify-center px-5 pt-20">
      <Reveal>
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-primary/60">
            <span>01 — INÍCIO</span>
          </div>
          <h1 className="text-display font-black leading-[0.85] tracking-tighter">
            {profile.name}
          </h1>
          <p className="mt-8 max-w-2xl text-editorial text-xl md:text-2xl lg:text-3xl leading-tight">
            {content.headline}
          </p>
          <div className="mt-12 flex flex-wrap gap-6">
            <a href="#projetos" className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors hover:text-primary">
              {t.hero.projects} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a href={profile.resume} download className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors hover:text-primary">
              <Download className="size-4" /> {t.hero.resume}
            </a>
          </div>
     </div>
    </Reveal>
   </section>

   <div className="mx-auto max-w-6xl px-5 space-y-32 pb-32">
    {/* About Section */}
    <section id="sobre" className="pt-20">
     <Reveal>
      <div className="grid gap-16 lg:grid-cols-[1fr_1.5fr]">
       <div className="space-y-8">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">01 / About</span>
          <h2 className="mt-2 text-4xl font-black md:text-5xl">{t.about.title}</h2>
        </div>
        <div className="space-y-6">
         <p className="text-xl font-medium leading-relaxed">
          {content.summary}
         </p>
         <p className="text-muted-foreground">
          {t.about.extra}
         </p>
        </div>
       </div>
       <div className="grid gap-8 sm:grid-cols-2">
        {t.about.highlights.map((item) => {
         const { icon: Icon } = highlightMeta(item.title);
         return (
          <Card key={item.title} className="technical-card group border-border/40 transition-all">
           <CardHeader className="pb-2">
            <Icon className="size-6 text-primary mb-2 transition-transform group-hover:scale-110" />
            <h3 className="text-sm font-bold uppercase tracking-widest">{item.title}</h3>
           </CardHeader>
           <CardContent>
            <p className="text-xs leading-relaxed text-muted-foreground font-mono">
             {item.description}
            </p>
           </CardContent>
          </Card>
         );
        })}
       </div>
      </div>
     </Reveal>
    </section>

    {/* Skills Section */}
    <section id="skills" className="pt-20">
     <Reveal>
      <div className="space-y-12">
       <div className="max-w-2xl space-y-4">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">02 / Skills</span>
        <h2 className="text-4xl font-black md:text-5xl">{t.skills.title}</h2>
        <p className="text-lg text-muted-foreground">{t.skills.description}</p>
       </div>
       
       <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {content.skillGroups.map((group) => {
         const { icon: Icon } = skillGroupMeta[group.icon];
         return (
          <Card key={group.title} className="technical-card flex flex-col border-border/40">
           <CardHeader className="pb-4">
            <div className="flex size-10 items-center justify-center bg-primary/10 text-primary mb-4 border border-primary/20">
              <Icon className="size-5" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-widest">{group.title}</h3>
           </CardHeader>
           <CardContent className="flex flex-wrap gap-2">
            {group.items.map((item) => (
             <Badge key={item} variant="secondary" className="font-mono text-[9px] uppercase tracking-wider">
              {item}
             </Badge>
            ))}
           </CardContent>
          </Card>
         );
        })}
       </div>
      </div>
     </Reveal>
    </section>

    {/* Career Section */}
    <section id="experiencia" className="pt-20">
     <Reveal>
      <div className="grid gap-20 lg:grid-cols-[1fr_2fr]">
       <div className="space-y-6">
         <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">03 / Career</span>
          <h2 className="mt-2 text-4xl font-black md:text-5xl">{t.career.title}</h2>
         </div>
         <p className="text-lg text-muted-foreground">{t.career.description}</p>
         <div className="space-y-6 pt-8">
          <div>
           <h4 className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">Languages</h4>
           <div className="flex flex-wrap gap-2">
            {content.languages.map((language) => (
             <Badge key={language} variant="outline" className="font-mono text-[10px] uppercase tracking-widest">
              {language}
             </Badge>
            ))}
           </div>
          </div>
         </div>
       </div>
       <div className="grid gap-16 md:grid-cols-2">
        <div>
          <h3 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-8">
           <ChevronRight className="size-4 text-primary" /> Professional Experience
          </h3>
          <Timeline entries={content.experience} />
        </div>
        <div>
          <h3 className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-8">
           <ChevronRight className="size-4 text-primary" /> Academic Background
          </h3>
          <Timeline entries={content.education} />
        </div>
       </div>
      </div>
     </Reveal>
    </section>

    {/* Projects Section */}
    <section id="projetos" className="pt-20">
     <Reveal>
      <div className="space-y-12">
       <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl space-y-4">
         <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">04 / Projects</span>
         <h2 className="text-4xl font-black md:text-5xl">{t.projects.title}</h2>
         <p className="text-lg text-muted-foreground">{t.projects.description}</p>
        </div>
       </div>
       
       <ProjectsGrid />
      </div>
     </Reveal>
    </section>

    {/* Articles Section */}
    <section id="artigos" className="pt-20">
     <Reveal>
      <div className="space-y-12">
       <div className="max-w-2xl space-y-4">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">05 / Writing</span>
        <h2 className="text-4xl font-black md:text-5xl">{t.articles.title}</h2>
        <p className="text-lg text-muted-foreground">{t.articles.description}</p>
       </div>
       <ArticlesGrid />
      </div>
     </Reveal>
    </section>

    {/* Contact Section */}
    <section id="contato" className="pt-20">
     <Reveal>
      <div className="grid gap-16 lg:grid-cols-[1.5fr_1fr]">
       <div className="space-y-12">
        <div className="space-y-4">
         <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-primary">06 / Contact</span>
         <h2 className="text-4xl font-black md:text-5xl">{t.contact.title}</h2>
         <p className="text-lg text-muted-foreground max-w-xl">{t.contact.description}</p>
        </div>
        
        <div className="grid gap-6 sm:grid-cols-2">
         {channels.map((chan) => (
          <a key={chan.label} href={chan.href} className="technical-card group relative overflow-hidden p-6 transition-all">
           <chan.icon className="size-6 text-primary mb-4 transition-transform group-hover:scale-110" />
           <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{chan.label}</span>
           <span className="mt-1 block text-lg font-bold font-mono tracking-tight">{chan.value}</span>
          </a>
         ))}
        </div>
       </div>
       <ContactForm />
      </div>
     </Reveal>
    </section>
   </div>

   <footer className="border-t border-border/40 py-12">
    <div className="mx-auto max-w-6xl px-5 flex flex-col md:flex-row items-center justify-between gap-8">
      <div className="flex flex-col items-center md:items-start gap-2">
       <span className="font-mono text-sm font-bold tracking-tighter uppercase">{profile.name} // {profile.role}</span>
       <p className="text-[10px] text-muted-foreground uppercase tracking-widest">© {new Date().getFullYear()} — Built for performance.</p>
      </div>
      <div className="flex gap-8 font-mono text-[10px] font-bold uppercase tracking-widest">
       <a href={profile.github} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Github</a>
       <a href={profile.linkedin} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Linkedin</a>
       <a href={profile.medium} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">Medium</a>
      </div>
    </div>
   </footer>
  </div>
 );
}
