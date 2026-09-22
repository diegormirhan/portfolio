import { useI18n } from "../lib/i18n";

export function LanguageToggle() {
  const { lang, toggleLang, t } = useI18n();

  return (
    <button
      type="button"
      onClick={toggleLang}
      aria-label={lang === "pt" ? t.header.switchToEnglish : t.header.switchToPortuguese}
      title={lang === "pt" ? t.header.switchToEnglish : t.header.switchToPortuguese}
      className="pressable inline-flex h-10 items-center rounded-full px-3 text-muted-foreground hover:bg-foreground/[0.07] hover:text-foreground"
    >
      <span className="text-[0.8125rem] font-semibold tracking-[0.02em]">
        {lang === "pt" ? "PT" : "EN"}
      </span>
    </button>
  );
}
