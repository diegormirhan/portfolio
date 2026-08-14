import { Github, Linkedin, Mail, PenLine } from "lucide-react";

import { useI18n } from "../lib/i18n";
import { profile } from "../lib/site-data";

export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {profile.name}. {t.footer}
        </p>
        <ul className="flex items-center gap-3">
          <li>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="inline-flex size-9 items-center justify-center rounded-full border border-border text-slate-300 hover:border-slate-300 hover:bg-slate-300/10"
            >
              <Github className="size-4" />
            </a>
          </li>
          <li>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              className="inline-flex size-9 items-center justify-center rounded-full border border-border text-blue-500 hover:border-blue-500 hover:bg-blue-500/10"
            >
              <Linkedin className="size-4" />
            </a>
          </li>
          <li>
            <a
              href={profile.medium}
              target="_blank"
              rel="noreferrer"
              aria-label="Medium"
              className="inline-flex size-9 items-center justify-center rounded-full border border-border text-green-500 hover:border-green-500 hover:bg-green-500/10"
            >
              <PenLine className="size-4" />
            </a>
          </li>
          <li>
            <a
              href={`mailto:${profile.email}`}
              aria-label="E-mail"
              className="inline-flex size-9 items-center justify-center rounded-full border border-border text-red-400 hover:border-red-400 hover:bg-red-400/10"
            >
              <Mail className="size-4" />
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
