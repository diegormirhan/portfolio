# Welcome to your Lovable project

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Open your project in the [Lovable editor](https://lovable.dev) and keep building.

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: connect the project to GitHub and every change made in Lovable is committed straight to your repository.
- **Full ownership**: this code is yours. Push to your repository and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Built with

- TanStack Start
- TypeScript
- React
- Tailwind CSS

## Deploy no AWS Amplify (site estático)

O `amplify.yml` na raiz já define tudo: o build roda com `NITRO_PRESET=static`,
que gera o site pré-renderizado (HTML estático) em `dist/client` — pasta já
configurada como `baseDirectory`.

Em **App settings → Rewrites and redirects**, adicione o fallback de SPA:

```
Source: /<*>   Target: /index.html   Type: 404 (Rewrite)
```

Depois disso, todo push na branch conectada (`diegormirhan/portfolio`)
dispara o deploy automático.

## Onde editar o conteúdo

- `src/lib/site-data.ts` — nome, bio, skills, experiência, formação e links.
- `src/lib/github.ts` — retriever dos repositórios fixados do GitHub.
- `src/lib/medium.ts` — retriever dos artigos do Medium.
- `src/routes/*.tsx` — páginas (início, sobre, projetos, artigos, experiência, contato).
