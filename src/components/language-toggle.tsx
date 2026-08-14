import { Languages } from "lucide-react";

import { useI18n } from "../lib/i18n";

export function LanguageToggle() {
  const { lang, toggleLang, t } = useI18n();

  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={lang === "pt" ? t.header.switchToEnglish : t.header.switchToPortuguese}
      title={lang === "pt" ? t.header.switchToEnglish : t.header.switchToPortuguese}
      className="inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-foreground hover:border-primary hover:text-primary"
    >
      <Languages className="size-4" aria-hidden />
      <span className="font-mono text-[11px] font-medium uppercase tracking-wider">
        {lang === "pt" ? "PT" : "EN"}
      </span>
    </button>
  );
}
