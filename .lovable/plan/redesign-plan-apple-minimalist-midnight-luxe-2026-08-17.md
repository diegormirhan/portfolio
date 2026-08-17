# Redesign Plan: Apple Minimalist (Midnight Luxe)

Redesign the portfolio to follow an "Apple Minimalist" aesthetic with a "Midnight Luxe" color palette, "Structured Dashboard" layout, and "Mono & Sans Tag" typography. This includes implementing an iOS-style liquid glass header and integrating shadcn/ui components throughout.

## User Preferences (from questions)
- **Visual Direction**: Apple Minimalist (Frosted glass, soft shadows, iOS-style fluid header)
- **Color Palette**: Midnight Luxe (#000000, #1c1c1e, #ffffff, #0a84ff)
- **Typography Pair**: JetBrains Mono (Headings/Tags) & Work Sans (Body)
- **Layout Structure**: Structured Dashboard Layout

## Proposed Changes

### 1. Style Definitions (`src/styles.css`)
- Update CSS variables to match the "Midnight Luxe" palette (Deep blacks, dark grays, system blue primary).
- Define typography scale using the new font pairing.
- Add utility classes for "liquid-glass" effects (backdrop-blur, transparency, subtle borders).
- Define shadcn-compatible theme variables (background, foreground, primary, muted, etc.).

### 2. Layout & Header
- **Site Header (`src/components/site-header.tsx`)**:
  - Implement a "liquid-glass" effect (iOS-style).
  - Use a floating, pill-shaped design or a full-width blur depending on the scroll position.
  - Smooth transitions between states.
- **Site Frame (`src/components/site-frame.tsx`)**:
  - Ensure the frame respects the minimalist dashboard layout.
- **Root Route (`src/routes/__root.tsx`)**:
  - Update Google Fonts link to include "JetBrains Mono" and "Work Sans".
  - Ensure the main container feels like a high-end dashboard.

### 3. Component Overhaul
- **Project Cards (`src/components/project-card.tsx`)**:
  - Redesign using shadcn/ui `Card` as a base.
  - Apply soft shadows and subtle borders.
  - Use JetBrains Mono for tags and metadata.
- **Article Cards (`src/components/article-card.tsx`)**:
  - Match project card styling for consistency.
- **Technical Skills (`src/routes/index.tsx`)**:
  - Reorganize into a dashboard-style grid.
  - Use shadcn `Badge` for skill tags.
- **Experience/Education Timeline (`src/routes/index.tsx`)**:
  - Clean up the timeline using a more minimalist, structured approach.

### 4. Animations (`src/components/reveal.tsx`, `src/components/background.tsx`)
- Refine "reveal" animations to be smoother and more "Apple-like".
- Update the background to a subtle, dark mesh gradient or a clean static dark surface that feels "Luxe".

## Technical Details
- **Palette Tokens (OKLCH)**:
  - `--background`: 0.12 0.01 250 (Midnight)
  - `--foreground`: 0.98 0.005 250 (White)
  - `--primary`: 0.6 0.2 250 (iOS Blue)
  - `--accent`: 0.3 0.02 250 (Deep Gray)
- **Fonts**:
  - `--font-display`: "JetBrains Mono"
  - `--font-body`: "Work Sans"
- **Glassmorphism**:
  - `backdrop-filter: blur(20px) saturate(180%);`
  - `background: rgba(28, 28, 30, 0.7);`
