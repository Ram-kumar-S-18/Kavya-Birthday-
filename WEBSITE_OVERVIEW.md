# Kaviya Birthday Website: Premium Romantic Editorial Journal

This document outlines the architectural and visual systems for Kaviya's Birthday website, designed to feel like a bespoke digital storybook.

---

## 1. Visual Theme: Cinematic Romantic Editorial
Unlike cold modern brutalism, this design focuses on a warm, intimate, and elegant experience:
*   **Backgrounds**: Warm Soft Linen (`#FAF8F5`) and deep Twilight Velvet (`#16131A`).
*   **Typography**: Serif *Cormorant Garamond* for titles/quotes, *Playfair Display* for hand-crafted notes, and *Inter* for legible paragraphs.
*   **Photo Mounts**: Fine-art glassmorphic frames with a double gold-espresso border, metadata labels, and interactive transitions (grayscale-to-color, blur-to-sharp, and cinematic slow zooms).
*   **Parallax Journal**: A continuous vertical page with overlapping editorial spreads and text that fades/reveals smoothly.

---

## 2. Audio System: Generative Romantic Piano
We use the Web Audio API to compose a live, arpeggiated piano melody:
*   **Oscillator Combo**: Triangle and Sine wave generators to create a soft, rounded note timbre.
*   **Chords**: Dreamy arpeggios looping over:
    *   `Cmaj7` (C4, E4, G4, B4)
    *   `Fmaj7` (F3, A3, C4, E4)
    *   `Am9` (A3, C4, E4, G4, B4)
    *   `G7sus4` (G3, C4, D4, F4)
*   **Trigger**: Opening the wax seal starts the soundtrack.

---

## 3. Interactive Gold Stardust Particles
*   A gold stardust background overlay drifts in the background.
*   The particles repel from the cursor on hover.
*   At the grand climax, particles pull together using a spring physics engine to spell out the final birthday letter.
