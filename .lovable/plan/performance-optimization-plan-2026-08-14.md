# Performance Optimization Plan

Optimize site loading and usability by reducing JavaScript bundle size, improving component performance, and optimizing asset delivery.

## User Review Required

> [!IMPORTANT]
> This plan focuses on performance improvements without changing the visual design of the site.

- The site's main bundle is currently ~600KB (gzip), which is slightly high for a landing page.
- Components like `Background` and `Reveal` will be optimized to reduce CPU usage.

## Proposed Changes

### 1. Bundle Optimization
- **Code Splitting:** Move `framer-motion` and other large libraries to their own chunks or lazy load them where possible.
- **Tree-shaking:** Ensure `lucide-react` icons are being imported individually to avoid bundling the entire library.

### 2. Component Performance
- **Background Optimization:** Simplify the `Background` component's animations. Reduce the number of `framer-motion` transforms and use CSS animations where possible to offload to the GPU.
- **Reveal Optimization:** Reduce the number of `Reveal` components or simplify their logic to avoid unnecessary re-renders and scroll listener overhead.
- **Lazy Loading:** Ensure all images (like article thumbnails) are correctly using `loading="lazy"` and have proper dimensions to prevent layout shifts.

### 3. Resource Pre-loading
- **Pre-connect:** Update `<head>` metadata in `src/routes/__root.tsx` to include `preconnect` and `dns-prefetch` for all external APIs (GitHub, Medium, Fonts).
- **Font Optimization:** Ensure fonts are loaded with `font-display: swap` (already partially done).

### 4. Implementation Details
- Refactor `src/components/background.tsx` to use more efficient animations.
- Update `src/components/project-card.tsx` and `src/components/article-card.tsx` to be lighter.
- Review `src/routes/index.tsx` for heavy loops or unnecessary state.

## Technical Details

- **Bundle Analysis:** We will monitor the `dist/client` size to ensure the changes are effective.
- **Framer Motion:** Use `LayoutGroup` where appropriate to optimize layout animations.
- **React Query:** Ensure `staleTime` is appropriately set to avoid excessive re-fetching.
