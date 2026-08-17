# Plan: Color Palette Migration to "Emerald Night"

Transition the portfolio's visual identity from the current purple/violet theme to a professional, luxurious "Emerald Night" palette (Deep Green/Forest/Slate).

## User Review Required

> [!IMPORTANT]
> This change replaces all purple accents, gradients, and semantic tokens with a deep emerald and forest green theme.

## Proposed Changes

### Styling & Theming
- **Update `src/styles.css` tokens**:
  - Replace `--background`, `--foreground`, `--primary`, `--accent`, and `--highlight` values in both light and dark modes with emerald-themed OKLCH values.
  - Update semantic tokens for cards, borders, and surfaces to match the new green-tinted dark mode.
  - Adjust glassmorphism utilities to use green-based translucent overlays.

### Visual Identity
- **Refine Background**: Ensure the background grid and mesh (if any) use the new emerald tones.
- **Update Site Frame**: Change the rotating border animation colors from purple to emerald/teal gradients.

## Technical Details

### New Color Palette (OKLCH)

**Dark Mode (Default)**
- Background: `oklch(0.14 0.02 160)` (Deep Forest Slate)
- Primary: `oklch(0.65 0.18 155)` (Vibrant Emerald)
- Accent: `oklch(0.35 0.08 160)` (Muted Forest)
- Highlight: `oklch(0.75 0.15 170)` (Seafoam/Teal)

**Light Mode**
- Background: `oklch(0.94 0.01 160)` (Mist Green)
- Primary: `oklch(0.45 0.14 155)` (Dark Emerald)

### Implementation
1. Batch update `src/styles.css` using `line_replace`.
2. Verify visual consistency across key sections (Hero, Skills, Timeline) using screenshots.
