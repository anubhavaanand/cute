---
name: "Phase C: Feature Modules"
about: Track implementation of tab management, sidebar file explorer, and command autocomplete
title: "[Phase C] "
labels: phase-c, features
assignees: ""
---

## Phase C: Feature Modules

### Overview
Build the core feature modules that make Cortex Terminal a productivity powerhouse: multi-session tab management, a file explorer that tracks your working directory, and history-based command autocomplete.

### Tasks

- [ ] **Implement tab management** — Support multiple simultaneous shell sessions; each tab spawns its own PTY; tabs can be created, renamed, closed, and switched via keyboard shortcuts
- [ ] **Build sidebar file explorer with tree view** — Display a file tree rooted at the current working directory; listen for `cd` command events from the PTY to update the tree automatically
- [ ] **Add command autocomplete based on local history** — Suggest completions as the user types; source from shell history (`~/.zsh_history` / `~/.bash_history`) and previously executed commands in the current session

### Tech Stack
- **Terminal**: xterm.js for rendering each tab's terminal
- **PTY**: `node-pty` (one instance per tab)
- **File System**: Node.js `fs` / `chokidar` for directory watching
- **Autocomplete**: React component with history parsing

### Acceptance Criteria
- [ ] Users can open ≥2 tabs each with an independent shell session
- [ ] The sidebar file tree updates when the user runs `cd <dir>` in the terminal
- [ ] Pressing `Tab` or `→` accepts an autocomplete suggestion from shell history

### Implementation Notes
- Detect `cd` by parsing PTY output for the shell prompt's `PWD` change, or hook into OSC sequences
- Persist tab sessions (restore tabs on restart if possible)
- Autocomplete should debounce to avoid performance issues on large history files

### References
- [xterm.js docs](https://xtermjs.org/docs/)
- [node-pty GitHub](https://github.com/microsoft/node-pty)
- [chokidar GitHub](https://github.com/paulmillr/chokidar)
