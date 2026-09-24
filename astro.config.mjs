import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://diegomirhan.com",
  trailingSlash: "ignore",
  i18n: {
    defaultLocale: "pt",
    locales: ["pt", "en"],
    routing: { prefixDefaultLocale: false },
  },
  prefetch: { prefetchAll: true },
});
