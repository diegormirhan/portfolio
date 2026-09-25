import { defineConfig } from "astro/config";

export default defineConfig({
  // Endereço oficial: o Amplify redireciona o domínio sem www para este
  site: "https://www.diegomirhan.com",
  trailingSlash: "ignore",
  i18n: {
    defaultLocale: "pt",
    locales: ["pt", "en"],
    routing: { prefixDefaultLocale: false },
  },
  prefetch: { prefetchAll: true },
});
