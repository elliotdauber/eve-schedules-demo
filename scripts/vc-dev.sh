#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

node_major() {
  node -p "process.version.slice(1).split('.')[0]"
}

ensure_node_24() {
  if [ "$(node_major)" -ge 24 ] 2>/dev/null; then
    return 0
  fi

  if command -v fnm >/dev/null 2>&1; then
    # shellcheck disable=SC1090
    eval "$(fnm env)"
    fnm use >/dev/null
  elif [ -s "${NVM_DIR:-$HOME/.nvm}/nvm.sh" ]; then
    # shellcheck source=/dev/null
    source "${NVM_DIR:-$HOME/.nvm}/nvm.sh"
    nvm use >/dev/null
  fi

  if [ "$(node_major)" -lt 24 ]; then
    echo "Node.js $(node --version) is too old for Eve (requires >=24)." >&2
    echo "Install Node 24, then run: fnm use   or: nvm use" >&2
    exit 1
  fi
}

ensure_node_24

if command -v vc >/dev/null 2>&1; then
  echo "Using Node.js $(node --version) with vc"
  exec vc dev "$@"
fi

if [ -f "${VC:-$HOME/repos/vercel/packages/cli/dist/vc.js}" ]; then
  echo "Using Node.js $(node --version) with local vc"
  exec node "${VC:-$HOME/repos/vercel/packages/cli/dist/vc.js}" dev "$@"
fi

echo "Vercel CLI not found. Install with: npm i -g vercel@latest" >&2
exit 1
