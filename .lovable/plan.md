# Plan to Optimize and Enhance Diego Mirhan Portfolio

Optimize performance, add dynamic background effects, improve navigation, and fix specific UI elements.

## Proposed Changes

### 1. Performance Optimization
- Add `loading="lazy"` to all non-critical images.
- Optimize web font loading by adding `font-display: swap` to global styles.
- Add resource hints (`dns-prefetch`, `preconnect`) for GitHub and Medium API endpoints.
- Ensure all Lucide icons are imported directly to enable tree-shaking.

### 2. Static Dynamic Background
- Enhance the current background with a subtle, non-distracting SVG noise filter for texture.
- Add a refined mesh gradient effect that feels "alive" but remains static in terms of layout (no heavy JS animations).
- Update the `site-frame` to have a slightly animated rim glow that responds to theme changes.

### 3. Header & Navigation Improvements
- Implement smooth scroll behavior globally via CSS.
- Enhance the `SiteHeader` with smoother transitions when clicking anchors.
- Refine the active section detection logic to be more precise.

### 4. Card Hover Animations
- Add `whileHover={{ scale: 1.02, y: -5 }}` to cards using `framer-motion` for a premium feel.
- Improve the `card-glow` utility in Tailwind to have a more prominent but tasteful effect on hover.

### 5. Content & Bug Fixes
- Remove the word "Brasil" from the hero section in `src/lib/site-data.ts`.
- Fix any layout shifts in the `Timeline` and `ContactForm` components.
- Ensure proper accessibility tags for all interactive elements.

## Technical Details

- **Smooth Scroll:** `scroll-behavior: smooth;` in `src/styles.css`.
- **Background Texture:** Using a CSS-only noise pattern overlay:
  ```css
  body::before {
    content: "";
    position: fixed;
    inset: 0;
    opacity: 0.03;
    z-index: -1;
    pointer-events: none;
    background-image: url("data:image/svg+xml,...");
  }
  ```
- **Card Animations:** Extending the `Reveal` component or wrapping card components in `motion.div`.
- **Performance:** Adding `dns-prefetch` for `https://api.github.com` and `https://api.rss2json.com` in `src/routes/index.tsx`.
