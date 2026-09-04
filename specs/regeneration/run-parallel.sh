#!/usr/bin/env bash
# Parallel multi-agent regeneration via Cursor Agent CLI.
# Requires: `agent login`, agent on PATH, repo already wiped (src/scripts/tests/data/*.ts gone).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"
PROMPT_DIR="$ROOT/specs/regeneration/prompts/parallel"
LOG_DIR="$ROOT/specs/regeneration/.regen-logs"
mkdir -p "$LOG_DIR"

deadline_epoch=$(( $(date +%s) + 1800 )) # 30 minutes
echo "Regeneration started $(date -u +%Y-%m-%dT%H:%M:%SZ); deadline +30m"

if ! command -v agent >/dev/null 2>&1; then
  echo "ERROR: Cursor Agent CLI ('agent') not on PATH" >&2
  exit 1
fi

run_agent() {
  local id="$1"
  local prompt_file="$2"
  local logfile="$LOG_DIR/${id}.log"
  echo "[$id] starting → $logfile"
  (
    agent -p --force --trust --sandbox disabled \
      --workspace "$ROOT" \
      "$(cat "$prompt_file")" \
      >"$logfile" 2>&1
    echo "[$id] exit=$?" >>"$logfile"
  ) &
  echo $! >"$LOG_DIR/${id}.pid"
}

wait_wave() {
  local failed=0
  for pidfile in "$LOG_DIR"/*.pid; do
    [[ -f "$pidfile" ]] || continue
    local pid
    pid="$(cat "$pidfile")"
    if ! wait "$pid"; then
      failed=1
      echo "Agent pid $pid failed"
    fi
    rm -f "$pidfile"
  done
  return "$failed"
}

check_deadline() {
  if (( $(date +%s) > deadline_epoch )); then
    echo "ERROR: exceeded 30 minute budget" >&2
    exit 2
  fi
}

echo "=== Wave 1: P1 P2 P3 P4 (parallel) ==="
run_agent P1 "$PROMPT_DIR/P1-data-ops.md"
run_agent P2 "$PROMPT_DIR/P2-server-core.md"
run_agent P3 "$PROMPT_DIR/P3-agent-vertex.md"
run_agent P4 "$PROMPT_DIR/P4-ui.md"
wait_wave || { echo "Wave 1 had failures — inspect $LOG_DIR"; exit 1; }
check_deadline

echo "=== Wave 2: P5 P6 (parallel) ==="
run_agent P5 "$PROMPT_DIR/P5-api.md"
run_agent P6 "$PROMPT_DIR/P6-tests.md"
wait_wave || { echo "Wave 2 had failures — inspect $LOG_DIR"; exit 1; }
check_deadline

echo "=== Wave 3: verify ==="
npm run db:seed
npm test
echo "Regeneration OK in $(( $(date +%s) - (deadline_epoch - 1800) ))s"
