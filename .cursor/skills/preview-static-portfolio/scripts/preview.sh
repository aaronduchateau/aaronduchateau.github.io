#!/usr/bin/env bash
# Build static export and serve out/ on http://localhost:3000
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../../../../" && pwd)"
cd "$ROOT"

PORT="${PORT:-3000}"

if [[ -s "$HOME/.nvm/nvm.sh" ]]; then
  export NVM_DIR="$HOME/.nvm"
  # shellcheck source=/dev/null
  . "$NVM_DIR/nvm.sh"
  nvm use
else
  echo "warning: nvm not found; using current node ($(node -v 2>/dev/null || echo unknown))" >&2
fi

echo "Stopping listeners on port $PORT..."
kill "$(lsof -i ":$PORT" -t 2>/dev/null)" 2>/dev/null || true
sleep 1

if [[ ! -d node_modules ]]; then
  echo "Installing dependencies..."
  npm install
fi

echo "Building..."
npm run build

echo "Starting static preview on port $PORT (detached)..."
# nohup + disown: keep serve alive after this script exits and after Cursor
# cleans up agent shells (otherwise localhost "crashes" while idle).
LOG="${TMPDIR:-/tmp}/aaron-portfolio-preview-${PORT}.log"
nohup npx --yes serve out -l "$PORT" >"$LOG" 2>&1 &
SERVE_PID=$!
disown "$SERVE_PID" 2>/dev/null || true

for _ in $(seq 1 30); do
  if curl -sf -o /dev/null "http://localhost:$PORT"; then
    echo ""
    echo "Ready: http://localhost:$PORT (pid $SERVE_PID, log $LOG)"
    exit 0
  fi
  sleep 1
done

echo "error: server did not respond on http://localhost:$PORT (see $LOG)" >&2
exit 1
