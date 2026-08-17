import { Menu, X, Github } from "lucide-react";
import { useEffect, useState } from "react";

import { LanguageToggle } from "./language-toggle";
import { ThemeToggle } from "./theme-toggle";
import { useI18n } from "../lib/i18n";
import { profile } from "../lib/site-data";
import { cn } from "../lib/utils";

export const sections = [
  { id: "inicio" },
  { id: "sobre" },
  { id: "skills" },
  { id: "experiencia" },
  { id: "projetos" },
  { id: "artigos" },
  { id: "contato" },
] as const;

type SectionId = (typeof sections)[number]["id"];

function useActiveSection() {
  const [active, setActive] = useState<string>(sections[0].id);

  useEffect(() => {
    const compute = () => {
      const line = window.scrollY + window.innerHeight * 0.2;
      let current = sections[0].id as string;
      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (!el) continue;
        if (el.offsetTop <= line + 10) current = section.id;
      }
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        current = "contato";
      }
      setActive(current);
    };

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  return active;
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const active = useActiveSection();
  const { t } = useI18n();

  return (
    <header className="fixed inset-x-0 top-0 z-50 py-6 mix-blend-difference invert dark:invert-0">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5">
        <a href="#inicio" className="text-sm font-bold tracking-tighter uppercase">
          {profile.name}
        </a>

        <nav
          className="hidden items-center gap-8 lg:flex"
          aria-label={t.header.mainNav}
        >
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest transition-opacity hover:opacity-100",
                active === section.id ? "opacity-100" : "opacity-40",
              )}
            >
              {t.nav[section.id as SectionId]}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <ThemeToggle />
          <LanguageToggle />
          <button
            type="button"
            aria-label={t.header.openMenu}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>


      {open ? (
        <nav
          className="glass-strong pointer-events-auto mx-auto mt-2 max-w-6xl rounded-3xl px-4 py-3 lg:hidden"
          aria-label={t.header.mobileNav}
        >
          <ul className="flex flex-col gap-1">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-full px-4 py-2 text-sm",
                    active === section.id ? "glass-pill text-foreground" : "text-muted-foreground",
                  )}
                >
                  {t.nav[section.id as SectionId]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
