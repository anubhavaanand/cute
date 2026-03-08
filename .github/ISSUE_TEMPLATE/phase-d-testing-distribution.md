---
name: "Phase D: Testing & Distribution"
about: Track Linux packaging and CI/CD pipeline setup for auto-releases
title: "[Phase D] "
labels: phase-d, ci-cd, packaging
assignees: ""
---

## Phase D: Testing & Distribution

### Overview
Package the Cortex Terminal for Arch Linux and configure a CI/CD pipeline with GitHub Actions so that every new git tag automatically produces a release artifact.

### Tasks

- [ ] **Set up Linux packaging** — Build a distributable `.AppImage` using `electron-builder` and/or write a `PKGBUILD` for AUR (Arch User Repository) submission
- [ ] **Configure CI/CD with GitHub Actions** — Create a workflow (`.github/workflows/release.yml`) that triggers on `v*` tag pushes, builds the Electron app for Linux x64, and uploads the artifacts as a GitHub Release

### Tech Stack
- **Packaging**: `electron-builder` (AppImage) + `PKGBUILD` (AUR)
- **CI/CD**: GitHub Actions
- **Target Platform**: Arch Linux x86_64

### Acceptance Criteria
- [ ] Running `electron-builder --linux AppImage` produces a working `.AppImage`
- [ ] A `PKGBUILD` exists that can be used with `makepkg -si` on Arch Linux
- [ ] Pushing a tag `v*` triggers the GitHub Actions release workflow
- [ ] The release workflow uploads the `.AppImage` as a GitHub Release asset

### PKGBUILD Skeleton
```bash
# Maintainer: Your Name <you@example.com>
pkgname=cortex-terminal
pkgver=0.1.0
pkgrel=1
pkgdesc="A cute, glassmorphism Electron terminal for Hyprland"
arch=('x86_64')
url="https://github.com/anubhavaanand/cute"
license=('MIT')
depends=('electron')
source=("$pkgname-$pkgver.tar.gz::$url/archive/v$pkgver.tar.gz")
sha256sums=('SKIP')

build() {
  cd "$pkgname-$pkgver"
  npm ci
  npm run build
  npx electron-builder --linux dir
}

package() {
  # electron-builder --linux dir outputs to dist/linux-unpacked/
  install -Dm755 "$pkgname-$pkgver/dist/linux-unpacked/$pkgname" \
    "$pkgdir/usr/bin/cortex-terminal"
}
```

### GitHub Actions Release Workflow
See `.github/workflows/release.yml` in this repository.

### References
- [electron-builder Linux targets](https://www.electron.build/configuration/linux)
- [AUR PKGBUILD guidelines](https://wiki.archlinux.org/title/PKGBUILD)
- [GitHub Actions: Creating a release](https://docs.github.com/en/actions/writing-workflows/choosing-when-your-workflow-runs/events-that-trigger-workflows#release)
