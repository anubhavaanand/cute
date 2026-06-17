---
name: "Phase B: The Cute UI/UX (Aesthetics)"
about: Track implementation of glassmorphism, JSON theme system, and Nerd Font loading
title: "[Phase B] "
labels: phase-b, ui-ux
assignees: ""
---

## Phase B: The "Cute" UI/UX (Aesthetics)

### Overview
Implement the visual identity of the Cortex Terminal — glassmorphism effects compatible with Hyprland, a JSON-based theme system, and custom Nerd Font support.

### Tasks

- [ ] **Implement glassmorphism** — Use `electron-vite` with vibrancy/transparency settings for Hyprland compatibility; configure `BrowserWindow` with `transparent: true` and apply CSS `backdrop-filter`
- [ ] **Create JSON-based theme system** — Define theme files (e.g., `themes/strawberry.json`) with color palettes, opacity, blur radius, and accent colors; load them dynamically at runtime
- [ ] **Add custom font loading for Nerd Fonts** — Bundle or load JetBrainsMono Nerd Font and FiraCode Nerd Font; apply via `@font-face` in global CSS

### Tech Stack
- **Build Tool**: `electron-vite`
- **Styling**: Tailwind CSS + custom CSS variables
- **Transparency**: Electron `BrowserWindow` vibrancy / `transparent` option
- **Fonts**: Nerd Fonts (JetBrainsMono, FiraCode)

### Acceptance Criteria
- [ ] Terminal window renders with a frosted-glass / blurred background on Hyprland
- [ ] Switching themes via `themes/*.json` updates all colors and opacity without restart
- [ ] Nerd Font icons (powerline symbols, devicons) render correctly in the terminal

### Theme JSON Schema Example
```json
{
  "name": "strawberry",
  "background": "rgba(30, 0, 20, 0.6)",
  "blur": "12px",
  "accent": "#ff3c6e",
  "foreground": "#ffd6e0",
  "cursor": "#ff3c6e",
  "font": "JetBrainsMonoNerdFont"
}
```

### References
- [electron-vite docs](https://electron-vite.org/)
- [Hyprland Electron transparency](https://wiki.hyprland.org/)
- [Nerd Fonts](https://www.nerdfonts.com/)
