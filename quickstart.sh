#!/bin/bash

# Quick Start Script for Custom Terminal
# Usage: ./quickstart.sh [command]

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Custom Terminal - Quick Start${NC}"
echo -e "=================================="
echo ""

# Check Rust
if command -v cargo &> /dev/null; then
    CARGO_VERSION=$(cargo --version)
    echo -e "${GREEN}✓ Found Rust: $CARGO_VERSION${NC}"
else
    echo -e "${YELLOW}⚠ Rust not found. Installing...${NC}"
    # Note: Installation depends on your system
    echo -e "${YELLOW}  Please install Rust from https://rustup.rs/${NC}"
    exit 1
fi

echo ""

# Compile Rust
cd "$PROJECT_DIR"
echo -e "${BLUE}🦀 Compiling Rust...${NC}"
cargo build --release
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Rust compilation successful${NC}"
else
    echo -e "${YELLOW}⚠ Rust compilation warnings (continuing)${NC}"
fi

echo ""

# Compile
cd "$PROJECT_DIR"
if [ -d "dist" ]; then
    echo -e "${YELLOW}  Cleaning old build...${NC}"
    rm -rf dist
fi
echo -e "${BLUE}🔨 Compiling TypeScript...${NC}"
tsc --skipLibCheck
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Compilation successful${NC}"
else
    echo -e "${YELLOW}⚠ Compilation warnings (continuing)${NC}"
fi

echo ""

# Get command from arguments or use default
if [ $# -eq 0 ]; then
    COMMAND="sudo pacman -S neofetch"
    echo -e "${BLUE}📍 No command provided, using default:${NC}"
    echo -e "${YELLOW}  $COMMAND${NC}"
elif [ "$1" = "ui" ]; then
    echo -e "${BLUE}🎨 Starting Interactive Terminal UI...${NC}"
    npm run ui
    exit 0
else
    COMMAND="$@"
    echo -e "${BLUE}📍 Running command:${NC}"
    echo -e "${YELLOW}  $COMMAND${NC}"
fi

echo ""

echo -e "${BLUE}▶️  Executing...${NC}"
echo ""

node dist/mvp-demo.mjs "$COMMAND"

echo ""
echo -e "${GREEN}✓ Done!${NC}"
echo ""

echo -e "${BLUE}💡 Tips:${NC}"
echo "  • Run: ./quickstart.sh [command]"
echo "  • UI: ./quickstart.sh ui"
echo "  • Examples:"
echo "    ./quickstart.sh npm install"
echo "    ./quickstart.sh sudo apt update"
echo "    ./quickstart.sh git clone <repo>"
echo ""
echo -e "${BLUE}📚 Learn more:${NC}"
echo "  • Read README.md for detailed info"
echo "  • Check IMPLEMENTATION_ROADMAP.md for next steps"
echo "  • Edit mvp-demo.mts to customize behavior"
echo ""
echo -e "${BLUE}🎨 Customize:${NC}"
echo "  • Edit weather.mts for your location"
echo "  • Edit overlay.mts for different styling"
echo "  • Edit journey-visualizer.mts for command recognition"
echo ""
