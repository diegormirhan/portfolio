---
name: Glass-Liquid Dark System
description: A sophisticated dark theme using deep violets, blurred gradients, and high-precision glassmorphism.
type: design
---
# Design System: Glass-Liquid Dark

## Visual Identity
A "Liquid Glass" aesthetic that feels both futuristic and organic. It relies on deep layered backgrounds, high-blur glass surfaces, and sharp, colorful accents.

## Color Palette (Semantic)
- **Background:** `oklch(0.165 0.03 300)` - Deep purple-slate, providing a canvas for glowing elements.
- **Primary:** `oklch(0.62 0.16 315)` - A vibrant violet for key highlights and active states.
- **Highlight:** `oklch(0.72 0.13 312)` - A softer, brighter purple for secondary accents.
- **Surface:** Glassmorphic layers with variable opacity and blur.

## Typography
- **Display:** "Inter" with tight tracking (-0.02em) and semi-bold weight for a tech-forward feel.
- **Mono:** System mono for labels and tags to emphasize technical precision.

## Motion & Interaction
- **Smoothness:** Heavy use of `framer-motion` for reveal animations and layout transitions.
- **Liquid Background:** Subtle, slow-moving blurred blobs that create depth without distraction.
- **Interaction Feedback:** Scale and glow effects on hover for all interactive cards.

## Components
- **Card (Modern):** Glassmorphic base with 20px blur, 1px subtle border, and a deep hover state with shadow-glow.
- **Timeline:** A vertical progression with circular animated icons.
- **Site Frame:** A rotating conic-gradient border that defines the workspace.
