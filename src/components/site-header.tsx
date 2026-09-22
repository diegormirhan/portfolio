import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Github, Menu, X } from "lucide-react";
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

const spring = { type: "spring", bounce: 0, duration: 0.4 } as const;

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
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:pt-5">
      <div className="material pointer-events-auto mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 rounded-full pl-2 pr-2">
        <a
          href="#inicio"
          aria-label="Diego Mirhan"
          className="pressable flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3"
        >
          <img src="/logo.png" alt="" className="size-9 rounded-full object-cover" />
          <span className="hidden text-[0.9375rem] font-semibold tracking-[-0.015em] sm:inline">
            Diego Mirhan
          </span>
        </a>

        <nav className="hidden items-center lg:flex" aria-label={t.header.mainNav}>
          {sections.slice(1).map((section) => {
            const isActive = active === section.id;
            return (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "relative rounded-full px-3.5 py-1.5 text-sm transition-colors duration-200",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive ? (
                  <motion.span
                    layoutId="nav-active"
                    transition={reduceMotion ? { duration: 0 } : spring}
                    className="absolute inset-0 -z-10 rounded-full bg-foreground/[0.08]"
                  />
                ) : null}
                {t.nav[section.id as SectionId]}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
          <a
            href={profile.github}
            target="_blank"
            rel="noreferrer"
            className="pressable ml-1 hidden h-10 items-center gap-2 rounded-full bg-foreground/[0.08] px-4 text-sm font-medium hover:bg-foreground/[0.13] sm:inline-flex"
          >
            <Github className="size-4" aria-hidden />
            GitHub
          </a>
          <button
            type="button"
            aria-label={t.header.openMenu}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
            className="pressable inline-flex size-10 items-center justify-center rounded-full text-foreground hover:bg-foreground/[0.07] lg:hidden"
          >
            {open ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.nav
            key="mobile-nav"
            aria-label={t.header.mobileNav}
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: -8, filter: "blur(8px)" }
            }
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, scale: 0.96, y: -8, filter: "blur(8px)" }
            }
            transition={reduceMotion ? { duration: 0.15 } : spring}
            style={{ transformOrigin: "top right" }}
            className="material-thick pointer-events-auto mx-auto mt-2 max-w-5xl rounded-[1.75rem] p-2 lg:hidden"
          >
            <ul className="flex flex-col">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "pressable block rounded-2xl px-4 py-3 text-[1.0625rem]",
                      active === section.id
                        ? "bg-foreground/[0.07] font-medium text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {t.nav[section.id as SectionId]}
                  </a>
                </li>
              ))}
            </ul>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
