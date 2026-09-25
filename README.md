<div align="center">

<img src="public/icon-192.png" alt="" width="96" height="96" />

# diegomirhan.com

**Personal portfolio of Diego Mirhan, AI & Software Development.**<br>
A bilingual, static site with a cinematic intro, a real-time 3D scene and a hidden "dev mode".

[![Astro](https://img.shields.io/badge/Astro-7-FF5D01?logo=astro&logoColor=white)](https://astro.build)
[![Three.js](https://img.shields.io/badge/Three.js-r186-000000?logo=threedotjs&logoColor=white)](https://threejs.org)
[![GSAP](https://img.shields.io/badge/GSAP-3.15-0AE448?logo=greensock&logoColor=black)](https://gsap.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![AWS Amplify](https://img.shields.io/badge/Hosted_on-AWS_Amplify-FF9900?logo=awsamplify&logoColor=white)](https://aws.amazon.com/amplify/)

[Live site](https://diegomirhan.com) • [English version](https://diegomirhan.com/en/) • [Features](#features) • [Getting started](#getting-started) • [How it works](#how-it-works)

<img src="public/og/site-en.png" alt="Diego Mirhan, AI & Software Development" width="720" />

</div>

## Overview

The site is a single Astro project that builds to plain static HTML. All the text lives in one file, [`PORTFOLIO.md`](PORTFOLIO.md), with Portuguese and English side by side. Medium articles, pinned GitHub repositories and each project's README are fetched **at build time**, so a daily rebuild keeps everything current without a backend.

On top of the static pages runs a motion layer: GSAP + ScrollTrigger for text and section reveals, Lenis for smooth scrolling, and a persistent Three.js scene that travels between one 3D object per section.

## Features

- **Cinematic intro**: a real preloader that waits for fonts, the 3D scene, images and the decoded impact sound. Then an "Enter" button expands into a movie-title cut and zooms through the "O" of the name.
- **Real-time 3D scene**: a neural network, an optimization surface plot, an AI chip with animated cables, a glass layer stack and a quantum computer. The camera flies between them as you scroll.
- **Dev mode**: a toggle that turns the site red and technical. It adds a ray-traced Gargantua black hole, gradient descent, a circuit-board cube, a heartbeat pulse with sand bursting from the bottom, floating code and math notes, a soundtrack that opens up with scroll and a volume slider.
- **Bilingual**: Portuguese at `/`, English at `/en/`, with language-specific resumes.
- **Runs everywhere**: animations always play, even with *reduce motion* on. Without WebGL (hardware acceleration off), a lightweight Canvas 2D background takes over. A **Lite mode** in the menu trades glass refraction and resolution for speed.
- **SEO ready**: per-page meta and Open Graph images, `hreflang` pairs, a schema.org graph (Person, WebSite, BlogPosting, SoftwareSourceCode), `sitemap.xml` and `robots.txt`.
- **Custom details**: an animated scrollbar in the site palette, a cursor-driven fluid smoke, magnetic buttons and page transitions with a curtain.

## Getting started

> [!IMPORTANT]
> Requires **Node.js 22.19 or newer**. The repo pins Node 24 in [`.nvmrc`](.nvmrc).

```bash
git clone https://github.com/diegormirhan/portfolio.git
cd portfolio
npm install
npm run dev
```

Open the address printed in the terminal (Astro's default is `http://localhost:4321`).

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run build` | Static build into `dist/` |
| `npm run preview` | Serves the built `dist/` locally |
| `npm run check` | Type checks with `astro check` |

> [!NOTE]
> The build fetches Medium, GitHub and project READMEs over the network. If a source is unavailable, that list is simply left out: the build never fails because of the network.

## Editing content

> [!TIP]
> You almost never need to touch `src/` to change text. Edit [`PORTFOLIO.md`](PORTFOLIO.md) and rebuild.

The frontmatter of `PORTFOLIO.md` holds the profile (links, per-language resume), the `pt` and `en` copy (role, summary, experience, skills, projects), the project list with images and repositories, and the dev mode notes. The rest of the file documents the design direction and the audio sources.

## How it works

```
src/
├── pages/        Routes: Portuguese at the root, English under /en/, plus sitemap.xml
├── views/        The actual pages (Home, Projects, Project, Blog, Article, Experience, Contact)
├── layouts/      Base.astro: head/SEO, preloader, header, menu, footer, background layers
├── lib/          content.ts (PORTFOLIO.md + paths + UI strings), data.ts (build-time fetches)
├── scripts/
│   ├── motion.ts     Lenis, preloader and intro, page transitions, text reveals, menu
│   ├── scene.ts      Three.js scene, camera travel between stations, dust, smoke, lite mode
│   ├── scene-kit.ts  Shared materials, glow sprites, pulse tubes, surface functions
│   ├── scene-hw.ts   AI chip, circuit-board cube, quantum computer
│   ├── scene-dev.ts  Dev mode objects: ∇, Gargantua (ray traced), matrix multiplication
│   ├── scene2d.ts    Canvas 2D fallback when WebGL is unavailable
│   ├── dev.ts        Dev mode: audio, heartbeat, sand, floating code, bubble transition
│   ├── fluid.ts      Cursor fluid simulation
│   └── scrollbar.ts  Custom scrollbar
└── styles/       Global styles and design tokens
```

- **Sections drive the scene.** Each section declares `data-scene` (plus optional offset, scale and dim). When it enters the viewport, the camera travels to that station.
- **The Three.js bundle is a separate chunk.** Content and animations never wait for it. The preloader only waits for the first compiled frame.
- **Page swaps keep the scene alive.** Astro's `ClientRouter` with `transition:persist` keeps the 3D canvas and dev mode layers running across navigations.

## Deployment

The site is deployed on **AWS Amplify** from the `main` branch using [`amplify.yml`](amplify.yml) (Node 24, output in `dist/`).

A GitHub Actions workflow, [`.github/workflows/rebuild.yml`](.github/workflows/rebuild.yml), triggers a daily rebuild through an Amplify incoming webhook. It needs the `AMPLIFY_WEBHOOK_URL` secret.
