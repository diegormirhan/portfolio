# Diego Mirhan — Software Engineer & Data Specialist

A high-performance portfolio showcasing full-stack engineering, data infrastructure, and AI-driven solutions. Built with a focus on modern design, smooth interactions, and optimized performance.

## 🚀 Tech Stack

This project leverages cutting-edge web technologies:

*   **[TanStack Start](https://tanstack.com/router/v1/docs/guide/start/overview):** Full-stack React framework for optimized SSR/SSG and type-safe routing.
*   **[React 19](https://react.dev/):** The latest version of the world's most popular UI library.
*   **[Tailwind CSS v4](https://tailwindcss.com/):** High-performance utility-first CSS framework with native theme variables.
*   **[Framer Motion](https://motion.dev/):** Powering smooth scroll animations and interactive micro-interactions.
*   **[Lucide React](https://lucide.dev/):** A beautiful and consistent icon set.

## 🏗️ Project Architecture

The codebase is organized into modular, type-safe components for maximum maintainability:

*   **`Background`**: Dynamic SVG-based mesh and grid backgrounds with parallax effects.
*   **`SiteFrame`**: A sophisticated animated border system using CSS masks and properties.
*   **`Reveal`**: Intersection observer-based animation wrapper for lazy-loading visual components.
*   **`SiteData`**: Centralized content management for easy updates (Skills, Experience, Projects).
*   **`Integrations`**: Real-time fetching from Medium (Articles) and GitHub (Pinned Repos).

## 🎨 Design Philosophy

*   **Glassmorphism 2.0:** Modern frosted-glass aesthetic with deep shadows and vibrant colored accents.
*   **Responsive & Accessible:** Fully optimized for mobile, tablet, and desktop viewports.
*   **Dark Mode Native:** Designed from the ground up to be easy on the eyes with a sleek dark aesthetic.

## ⚙️ Development

1. Clone the repository:
   ```bash
   git clone https://github.com/diegormirhan/portfolio.git
   ```
2. Install dependencies:
   ```bash
   bun install
   ```
3. Run the development server:
   ```bash
   bun run dev
   ```

## ☁️ Deployment (AWS Amplify)

Configured for high-performance static hosting:
*   **Build Preset:** Static pre-rendering (SSG).
*   **Artifacts Directory:** `dist/client`.
*   **SPA Rewrites:** Ensure `/<*>` redirects to `/index.html` (Type 404 Rewrite) in Amplify Console.

---
*Developed by [Diego Mirhan](https://github.com/diegormirhan)*
