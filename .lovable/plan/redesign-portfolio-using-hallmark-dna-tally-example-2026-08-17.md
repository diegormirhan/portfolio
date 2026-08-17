# Redesign Portfolio using Hallmark DNA (Tally Example)

I will redesign the portfolio using the Hallmark design skill, extracting the "DNA" from the Tally example (https://www.usehallmark.com/examples/tally/) which features a clean, structural, and tactile aesthetic.

## User Review Required

> [!IMPORTANT]
> The redesign will move away from the current "dark glassmorphism" look towards a more "Editorial/Tactile" aesthetic as seen in the Tally example. This includes changes to fonts, colors (towards more structured light/dark modes), and section rhythms.

## Proposed Changes

### Design System (Hallmark DNA extraction)
- **Genre**: Editorial / Structural
- **Palette**: Shift towards a cleaner, high-contrast palette. More refined use of surface colors instead of heavy gradients.
- **Typography**: Refine font pairings for better hierarchy (cleaner display fonts).
- **Macrostructure**: Redesign section rhythms to avoid the standard hero -> grid -> footer pattern.

### Components Redesign
- **Cards**: Move from "Glassmorphism" to a more "Structured/Tactile" design (cleaner borders, subtle shadows, defined surfaces).
- **Timeline**: Redesign the Experience/Education timeline for better readability and a more professional look.
- **Header/Footer**: Simplify and refine the navigation and brand elements.

### Technical Implementation
- Update `src/styles.css` with new semantic tokens and utilities.
- Refactor `src/routes/index.tsx` to use the new macrostructure and redesigned components.
- Maintain existing performance optimizations (lazy loading, reduced motion support).

## Verification Plan

### Automated Checks
- Run `bun run build` to ensure no regressions.
- Screenshot verification for mobile (320px) and desktop (1280px) viewports.

### Manual Verification
- Check theme switching (Light/Dark) for contrast and readability.
- Verify smooth scrolling and animations.
- Ensure the "site frame" border animation still works but fits the new aesthetic.
