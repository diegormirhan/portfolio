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
  // O blog saiu deste site e foi para o Ghost: os endereços antigos (estavam no sitemap) levam ao post
  // equivalente. As versões em inglês vão para o post em português, o único que existe no blog.
  redirects: {
    "/blog": "https://blog.diegomirhan.com/",
    "/en/blog": "https://blog.diegomirhan.com/",
    "/blog/como-construi-um-rag-com-tres-bases-que-roteia-sem-chamar-um-llm-sequer": "https://blog.diegomirhan.com/como-construi-um-rag-com-tres-bases-que-roteia-sem-llm/",
    "/blog/a-computacao-quantica-esta-mais-longe-do-que-parece-e-a-entropia-e-uma-das-principais-razoes-disso": "https://blog.diegomirhan.com/computacao-quantica-mais-longe-do-que-parece-entropia/",
    "/blog/analisando-o-pipeline-de-execucao-da-cpu-como-as-instrucoes-sao-processadas-e-otimizadas-atraves": "https://blog.diegomirhan.com/pipeline-de-execucao-da-cpu/",
    "/blog/como-a-cache-hierarquica-e-a-localidade-de-memoria-afetam-a-performance-em-sistemas-multithread": "https://blog.diegomirhan.com/cache-hierarquica-e-localidade-de-memoria-em-multithread/",
    "/blog/entender-decimais-nao-e-o-suficiente-para-se-tornar-um-desenvolvedor": "https://blog.diegomirhan.com/entender-decimais-nao-e-suficiente-para-ser-desenvolvedor/",
    "/en/blog/quantum-computing-is-further-away-than-it-seems-and-entropy-is-one-of-the-main-reasons-for-this": "https://blog.diegomirhan.com/computacao-quantica-mais-longe-do-que-parece-entropia/",
    "/en/blog/analyzing-the-cpu-execution-pipeline-how-instructions-are-processed-and-optimized-through-branch": "https://blog.diegomirhan.com/pipeline-de-execucao-da-cpu/",
    "/en/blog/how-hierarchical-cache-and-memory-locality-affect-performance-in-multithread-systems": "https://blog.diegomirhan.com/cache-hierarquica-e-localidade-de-memoria-em-multithread/",
    "/en/blog/understanding-decimals-is-not-enough-to-become-a-developer": "https://blog.diegomirhan.com/entender-decimais-nao-e-suficiente-para-ser-desenvolvedor/",
    // O ToolHaven virou Tools4Devs: o endereço antigo do projeto continua funcionando
    "/projetos/toolhaven-desktop": "/projetos/tools4devs/",
    "/en/projects/toolhaven-desktop": "/en/projects/tools4devs/",
  },
});
