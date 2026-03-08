# Cortex Terminal — Copilot Instructions

## Project Overview
Cortex Terminal is a "cute", glassmorphism Electron terminal emulator targeting **Arch Linux with Hyprland**. It uses React + TypeScript for the UI, xterm.js for terminal rendering, node-pty for PTY spawning, and Electron IPC for secure UI-to-system communication.

## Implementation Checklist

- [x] Verify that the copilot-instructions.md file in the .github directory is created.

### Phase A: The Skeleton (System Integration)
- [ ] Set up IPC Bridge in `preload.js` to securely expose shell-execution functions to React via `contextBridge`
- [ ] Implement PTY Spawn using `node-pty` to spawn `/bin/zsh` or `/bin/bash` in the Main process
- [ ] Establish bidirectional data flow (Frontend ↔ Main ↔ PTY)

### Phase B: The "Cute" UI/UX (Aesthetics)
- [ ] Implement glassmorphism using `electron-vite` with vibrancy/transparency for Hyprland compatibility
- [ ] Create JSON-based theme system (e.g., `themes/strawberry.json`)
- [ ] Add custom font loading for Nerd Fonts (JetBrainsMono, FiraCode)

### Phase C: Feature Modules
- [ ] Implement tab management for multiple shell sessions
- [ ] Build sidebar file explorer with tree view that reacts to `cd` commands
- [ ] Add command autocomplete based on local history

### Phase D: Testing & Distribution
- [ ] Set up Linux packaging (`.AppImage` or `PKGBUILD` for AUR)
- [ ] Configure CI/CD with GitHub Actions for auto-releases on tag creation (see `.github/workflows/release.yml`)

## Tech Stack
- **Frontend**: React + TypeScript + Tailwind CSS
- **Terminal Engine**: xterm.js + node-pty
- **IPC**: Electron IPC (`ipcMain` / `ipcRenderer` / `contextBridge`)
- **Build**: electron-vite
- **Target**: Arch Linux x86_64 with Hyprland window manager

## GitHub Issue System
Issue templates for each phase live in `.github/ISSUE_TEMPLATE/`:
- `phase-a-skeleton.md` — System Integration
- `phase-b-ui-ux.md` — Aesthetics
- `phase-c-features.md` — Feature Modules
- `phase-d-testing-distribution.md` — Testing & Distribution

Label definitions are in `.github/labels.yml`.

