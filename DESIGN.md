# Design

<!-- impeccable:design-schema 1 -->

## Incumbent World

The project currently uses an **Apple Minimalist** aesthetic with a **Midnight Luxe** theme. This is characterized by:
- **Typography:** JetBrains Mono for display/monospaced elements and Work Sans for body text.
- **Palette:** Dark base (`oklch(0.12 0.01 250)`) with iOS-style blue primary (`oklch(0.6 0.2 250)`) and off-white foreground.
- **Materiality:** Glassmorphism (frosted glass) for headers and cards, using backdrop-filters and subtle borders.
- **Layout:** A structured, vertical dashboard-style layout with numbered sections and bold, italicized headings.

## Direction: The "Foundational Lab"

The user wants a complete design change. While they previously asked for "Apple Minimalist", the request for a "complete change" suggests we should push into a more distinctive, technical, and "lab-like" territory that reinforces the **Local AI / Hardware** positioning.

### Visual Concept: "The Neural Foundry"
A design language that feels like a high-performance developer tool or an AI workstation. It moves away from the "consumer glass" look toward a "precision instrument" aesthetic.

- **Eras/Era:** Modern Technical / Brutalist-Utility.
- **Palette:** "Circuit Board" — A deep Obsidian base with High-Visibility Green or Cyber-Orange accents, moving away from standard iOS blue.
- **Typography:** Monospaced fonts for all technical data, but using a high-contrast Serif (like Instrument Serif) for big narrative moments to maintain "Editorial" quality.
- **Materials:** Solid surfaces, dot-matrix grids, and "hard" shadows rather than soft glass blurs.

## Implementation Principles
- **Grid-Driven:** Everything sits on a visible or strongly implied strict modular grid.
- **Data-Rich:** Display technical metadata (like GitHub stars, tech tags) as integral design elements, not just secondary labels.
- **Micro-Interactions:** Snappy, immediate state changes that feel like physical switches.

## Surface Strategy: Home (`/`)
- **Hero:** A high-impact typographic statement that immediately frames the "Local AI" narrative.
- **Dashboard:** A multi-column modular grid where projects and skills are grouped like modules in an IDE.
- **Timeline:** A simplified, high-contrast vertical track that emphasizes the "Career" progression.
