#!/usr/bin/env bash
set -euo pipefail

# start.sh - start backend and frontend with simple pid/log management
# Usage: ./start.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIDS_DIR="$SCRIPT_DIR/.pids"
LOG_DIR="$SCRIPT_DIR/logs"

mkdir -p "$PIDS_DIR" "$LOG_DIR"

backend_pidfile="$PIDS_DIR/backend.pid"
frontend_pidfile="$PIDS_DIR/frontend.pid"
server_log="$LOG_DIR/server.log"
client_log="$LOG_DIR/client.log"

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
  fi
}

echo "Stopping any existing backend/frontend managed by this script..."
stop_if_running "$backend_pidfile"
stop_if_running "$frontend_pidfile"

echo "Starting backend (node server.js)..."
cd "$SCRIPT_DIR"
nohup npm run dev:backend > "$server_log" 2>&1 &
backend_pid=$!
echo "$backend_pid" > "$backend_pidfile"
echo "Backend PID: $backend_pid (logs: $server_log)"

echo "Starting frontend (vite)..."
cd "$SCRIPT_DIR/client"
nohup npm run dev > "$client_log" 2>&1 &
frontend_pid=$!
echo "$frontend_pid" > "$frontend_pidfile"
echo "Frontend PID: $frontend_pid (logs: $client_log)"

echo "Waiting a moment for services to warm up..."
sleep 2

echo "Backend health:"
curl -sS --fail http://localhost:5000/api/health || echo "(backend health check failed)"

echo "Frontend root (head):"
curl -sS --fail http://localhost:5173/ | head -n 2 || echo "(frontend not responding)"

echo "Done. Use ./stop.sh to stop services."
