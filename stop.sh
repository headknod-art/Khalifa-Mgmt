#!/usr/bin/env bash
set -euo pipefail

# stop.sh - stop services started by start.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIDS_DIR="$SCRIPT_DIR/.pids"

backend_pidfile="$PIDS_DIR/backend.pid"
frontend_pidfile="$PIDS_DIR/frontend.pid"

stop_if_running() {
  local pidfile="$1"
  if [ -f "$pidfile" ]; then
    pid=$(cat "$pidfile" 2>/dev/null || echo "")
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      echo "Stopping pid $pid"
      kill "$pid" || true
      sleep 1
      if kill -0 "$pid" 2>/dev/null; then
        echo "PID $pid didn't stop; killing"
        kill -9 "$pid" || true
      fi
    fi
    rm -f "$pidfile"
  else
    echo "No pidfile $pidfile"
  fi
}

stop_if_running "$backend_pidfile"
stop_if_running "$frontend_pidfile"

echo "Stopped services managed by this repo (if any)."
