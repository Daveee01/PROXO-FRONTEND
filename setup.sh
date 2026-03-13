#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────
#  AR Tree App — Setup Script
#  Run once after cloning:  bash setup.sh
# ─────────────────────────────────────────────────────────────
set -e

# ── Color helpers ────────────────────────────────────────────
GREEN='\033[0;32m'; CYAN='\033[0;36m'; RESET='\033[0m'
ok()   { echo -e "${GREEN}✓  $1${RESET}"; }
info() { echo -e "${CYAN}→  $1${RESET}"; }

echo ""
echo "  AR Tree App — Dependency Setup"
echo "  ─────────────────────────────"
echo ""

# ── Node version check ───────────────────────────────────────
REQUIRED_NODE=18
CURRENT_NODE=$(node -v 2>/dev/null | sed 's/v//' | cut -d. -f1 || echo "0")

if [ "$CURRENT_NODE" -lt "$REQUIRED_NODE" ] 2>/dev/null; then
  echo "  Node.js >= v${REQUIRED_NODE} is required (found: v${CURRENT_NODE})"
  echo "  Install from https://nodejs.org or use nvm:"
  echo "    nvm install 20 && nvm use 20"
  exit 1
fi
ok "Node.js v$(node -v | sed 's/v//')"

# ── Package manager detection ────────────────────────────────
# Prefer npm when package-lock.json exists to keep installs reproducible.
if [ -f package-lock.json ]; then
  PKG="npm"
elif command -v pnpm &>/dev/null && [ -f pnpm-lock.yaml ]; then
  PKG="pnpm"
elif command -v yarn &>/dev/null && [ -f yarn.lock ]; then
  PKG="yarn"
else
  PKG="npm"
fi
ok "Using $PKG"

# ── Install dependencies ─────────────────────────────────────
info "Installing dependencies (this may take a minute)..."
case $PKG in
  pnpm) pnpm install --frozen-lockfile ;;
  yarn) yarn install --frozen-lockfile ;;
  npm)  npm ci ;;
esac
ok "Dependencies installed"

# ── .env check ───────────────────────────────────────────────
if [ ! -f .env.local ]; then
  if [ -f .env.example ]; then
    cp .env.example .env.local
    ok "Created .env.local from .env.example"
  else
    info ".env.local not found — create it if you need environment variables"
  fi
else
  ok ".env.local already exists"
fi

# ── Done ─────────────────────────────────────────────────────
echo ""
echo "  All set! Start the dev server with:"
echo ""
echo "    $PKG run dev"
echo ""
echo "  Then open http://localhost:3000"
echo ""
