# Plan - Portfolio Visual and Functional Improvements

Improve the portfolio by adding a more attractive static background, animating blocks and widgets, fixing the "Focus" section (broken), modernizing the languages section, and updating language data.

## User Preferences
- **Background**: More beautiful and static, matching the color palette.
- **Animations**: Animate blocks and widgets on the page.
- **Fixes**: Fix the "Total Focus" (Foco Total) section which is broken.
- **Languages**: Modernize the visual and remove "Português nativo".

## Proposed Changes

### 1. Styling & Background (`src/styles.css`, `src/routes/__root.tsx`)
- Add a subtle, sophisticated static background using CSS gradients or a pattern that matches the existing oklch-based purple/slate palette.
- Remove the global `animation: none !important` and `transition: none !important` rules from `src/styles.css` to allow animations.
- Define a new "Animated Reveal" system using Framer Motion (or simple CSS classes if preferred, but Framer Motion is better for "widgets").

### 2. Animations (`src/components/reveal.tsx`)
- Implement `framer-motion` in the `Reveal` component to provide scroll-triggered animations (fade-in, slide-up) for all sections.
- Add hover animations to cards using Tailwind's `group-hover` or Framer Motion.

### 3. Data Updates (`src/lib/site-data.ts`)
- Remove "Português nativo" from the `languages` array in both `pt` and `en` objects.
- Ensure the "Foco Total" (Total Focus) section data is correct.

### 4. "Total Focus" Fix (`src/routes/index.tsx`, `src/lib/i18n.tsx`)
- The user mentioned "Foco Total" is broken. In the code, this corresponds to the "Foco atual" (currently) section.
- I will check the layout and fix any responsiveness or alignment issues. I'll also rename the heading in `i18n.tsx` to "Foco Total" as requested by the user.

### 5. Languages Section Modernization (`src/routes/index.tsx`)
- Redesign the languages list to use a more modern "grid of pills" or "progress bar" style instead of a simple bulleted list.

### 6. Bug Fixes
- Check for any console errors or hydration mismatches.
- Ensure the "Reveal" component is working correctly now that global animation overrides are removed.

## Technical Details
- **Framer Motion**: Use `motion.div` for smooth, performant animations.
- **OKLCH**: Continue using the existing oklch color system for consistency.
- **Layout**: Ensure sections have proper spacing and transitions.

## Security Considerations
- No sensitive data or auth changes involved. Standard frontend UI improvements.
