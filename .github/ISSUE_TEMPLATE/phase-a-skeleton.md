---
name: "Phase A: The Skeleton (System Integration)"
about: Track implementation of IPC Bridge, PTY Spawn, and bidirectional data flow
title: "[Phase A] "
labels: phase-a, system-integration
assignees: ""
---

## Phase A: The Skeleton (System Integration)

### Overview
Set up the core system integration layer for the Cortex Terminal, enabling secure communication between the React frontend and the native shell process via Electron IPC and node-pty.

### Tasks

- [ ] **Set up IPC Bridge in preload.js** — Securely expose shell-execution functions to React using `contextBridge.exposeInMainWorld`
- [ ] **Implement PTY Spawn using node-pty** — Spawn `/bin/zsh` or `/bin/bash` in the Main process with proper environment variables
- [ ] **Establish bidirectional data flow (Frontend ↔ Main ↔ PTY)** — Wire up `ipcMain`/`ipcRenderer` events so the React UI can send input to PTY and receive output in real time

### Tech Stack
- **IPC**: Electron IPC (`ipcMain` / `ipcRenderer` / `contextBridge`)
- **PTY**: `node-pty` for spawning the shell process
- **Frontend**: React + TypeScript

### Acceptance Criteria
- [ ] Typing in the React terminal component sends keystrokes to the PTY
- [ ] Shell output (stdout/stderr) is streamed back to the React component
- [ ] IPC bridge does not expose unsafe Node.js APIs directly to the renderer

### References
- [Electron contextBridge docs](https://www.electronjs.org/docs/latest/api/context-bridge)
- [node-pty GitHub](https://github.com/microsoft/node-pty)
