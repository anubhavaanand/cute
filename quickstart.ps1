# Quick Start Script for Custom Terminal (Windows)
# Usage: .\quickstart.ps1 [command]

param(
    [string]$Command = "",
    [switch]$UI,
    [switch]$Rust
)

$PROJECT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path

# Colors for output (PowerShell)
$GREEN = "Green"
$BLUE = "Blue"
$YELLOW = "Yellow"
$NC = "White"

Write-Host "🚀 Custom Terminal - Quick Start" -ForegroundColor $BLUE
Write-Host "=================================="
Write-Host ""

# Check Rust
if (Get-Command cargo -ErrorAction SilentlyContinue) {
    $CARGO_VERSION = & cargo --version
    Write-Host "✓ Found Rust: $CARGO_VERSION" -ForegroundColor $GREEN
} else {
    Write-Host "⚠ Rust not found. Installing..." -ForegroundColor $YELLOW
    Write-Host "  Please install Rust from https://rustup.rs/" -ForegroundColor $YELLOW
    exit 1
}

# Check Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    $NODE_VERSION = & node --version
    Write-Host "✓ Found Node.js: $NODE_VERSION" -ForegroundColor $GREEN
} else {
    Write-Host "⚠ Node.js not found. Installing..." -ForegroundColor $YELLOW
    Write-Host "  Please install Node.js from https://nodejs.org/" -ForegroundColor $YELLOW
    exit 1
}

# Check npm
if (Get-Command npm -ErrorAction SilentlyContinue) {
    $NPM_VERSION = & npm --version
    Write-Host "✓ Found npm: $NPM_VERSION" -ForegroundColor $GREEN
} else {
    Write-Host "⚠ npm not found. Please install Node.js" -ForegroundColor $YELLOW
    exit 1
}

Write-Host ""

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor $BLUE
    & npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ Dependencies installed" -ForegroundColor $GREEN
}

Write-Host ""

# Compile Rust
Set-Location $PROJECT_DIR
Write-Host "🦀 Compiling Rust..." -ForegroundColor $BLUE
& cargo build --release
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Rust compilation successful" -ForegroundColor $GREEN
} else {
    Write-Host "⚠ Rust compilation warnings (continuing)" -ForegroundColor $YELLOW
}

Write-Host ""

# Compile TypeScript
if (Test-Path "dist") {
    Write-Host "  Cleaning old build..." -ForegroundColor $YELLOW
    Remove-Item -Recurse -Force dist
}
Write-Host "🔨 Compiling TypeScript..." -ForegroundColor $BLUE
& npx tsc --skipLibCheck
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Compilation successful" -ForegroundColor $GREEN
} else {
    Write-Host "⚠ Compilation warnings (continuing)" -ForegroundColor $YELLOW
}

Write-Host ""

# Handle command execution
if ($UI) {
    Write-Host "🎨 Starting Interactive Terminal UI..." -ForegroundColor $BLUE
    & npm run ui
    exit 0
} elseif ($Rust) {
    Write-Host "🦀 Starting Rust Terminal Backend..." -ForegroundColor $BLUE
    & ".\target\release\custom_terminal.exe"
    exit 0
} elseif ($Command -eq "") {
    $Command = "echo 'Hello from Custom Terminal!'"
    Write-Host "📍 No command provided, using default:" -ForegroundColor $BLUE
    Write-Host "  $Command" -ForegroundColor $YELLOW
} else {
    Write-Host "📍 Running command:" -ForegroundColor $BLUE
    Write-Host "  $Command" -ForegroundColor $YELLOW
}

Write-Host ""
Write-Host "▶️  Executing..." -ForegroundColor $BLUE
Write-Host ""

& node dist/mvp-demo.mjs $Command

Write-Host ""
Write-Host "✓ Done!" -ForegroundColor $GREEN
Write-Host ""

Write-Host "💡 Tips:" -ForegroundColor $BLUE
Write-Host "  • Run: .\quickstart.ps1 -Command 'your command'"
Write-Host "  • UI: .\quickstart.ps1 -UI"
Write-Host "  • Rust Backend: .\quickstart.ps1 -Rust"
Write-Host "  • Examples:"
Write-Host "    .\quickstart.ps1 -Command 'npm install'"
Write-Host "    .\quickstart.ps1 -Command 'git clone <repo>'"
Write-Host ""

Write-Host "📚 Learn more:" -ForegroundColor $BLUE
Write-Host "  • Read README.md for detailed info"
Write-Host "  • Check IMPLEMENTATION_ROADMAP.md for next steps"
Write-Host "  • Edit mvp-demo.mts to customize behavior"
Write-Host ""

Write-Host "🎨 Customize:" -ForegroundColor $BLUE
Write-Host "  • Edit weather.mts for your location"
Write-Host "  • Edit overlay.mts for different styling"
Write-Host "  • Edit journey-visualizer.mts for command recognition"
Write-Host ""