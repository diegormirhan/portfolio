# diegomirhan.com

Portfólio pessoal de Diego Mirhan. Astro 7 (estático) + GSAP/ScrollTrigger + Lenis + Three.js.

## Conteúdo

Todo o texto do site mora em [`PORTFOLIO.md`](PORTFOLIO.md) (frontmatter YAML, PT e EN lado a lado).
Artigos do Medium, repositórios fixados do GitHub e o README de cada projeto são buscados **no build**.

## Rodar

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # gera dist/
npm run check    # tipos (astro check)
```

## Estrutura

- `src/pages`: rotas (PT na raiz, EN em `/en/`); cada arquivo só escolhe a view e o idioma.
- `src/views`: as páginas de fato.
- `src/layouts/Base.astro`: head, preloader, header, menu, rodapé, cortina de transição.
- `src/scripts/scene.ts`: cena Three.js (partículas que morfam, bolhas, rastro do cursor).
- `src/scripts/motion.ts`: Lenis, transições, revelações de texto e demais animações.

## Deploy

AWS Amplify (`amplify.yml`, saída em `dist/`). O workflow `.github/workflows/rebuild.yml`
dispara um rebuild diário via webhook do Amplify (secret `AMPLIFY_WEBHOOK_URL`).
