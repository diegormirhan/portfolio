import { useI18n } from "../lib/i18n";
import { profile } from "../lib/site-data";

const links = [
  { label: "GitHub", href: profile.github },
  { label: "LinkedIn", href: profile.linkedin },
  { label: "Medium", href: profile.medium },
  { label: "E-mail", href: `mailto:${profile.email}` },
];

export function SiteFooter() {
  const { t } = useI18n();

  return (
    <footer className="mx-auto w-full max-w-5xl px-5 pb-12 sm:px-8">
      <div className="text-caption flex flex-col gap-4 border-t border-border pt-6 text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {profile.name}. {t.footer}
        </p>
        <ul className="flex flex-wrap gap-x-6 gap-y-2">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="transition-colors duration-200 hover:text-foreground"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
