import { Menu, X } from "lucide-react";
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
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection();
  const { t } = useI18n();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300 foundry-header",
        scrolled ? "py-3" : "py-6"
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5">
        <a href="#inicio" className="text-sm font-bold tracking-[0.2em] uppercase font-mono">
          {profile.name} <span className="text-primary opacity-50">//</span> LAB
        </a>

        <nav
          className="hidden items-center gap-2 lg:flex"
          aria-label={t.header.mainNav}
        >
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className={cn(
                "foundry-pill",
                active === section.id && "foundry-pill-active"
              )}
            >
              {t.nav[section.id as SectionId]}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <LanguageToggle />
          <button
            type="button"
            aria-label={t.header.openMenu}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="lg:hidden rounded-full p-2 hover:bg-muted"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          className="foundry-header mt-2 mx-4 p-4 lg:hidden animate-in slide-in-from-top-2"
          aria-label={t.header.mobileNav}
        >
          <ul className="flex flex-col gap-2">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block rounded-full px-4 py-2 text-sm font-medium",
                    active === section.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                  )}
                >
                  {t.nav[section.id as SectionId]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
