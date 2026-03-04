#!/usr/bin/env bash
set -euo pipefail
HOST="${1:-127.0.0.1}"
PORT="${2:-8080}"
echo "Starting Concrete Mix Design App at http://${HOST}:${PORT}"
exec php -S "${HOST}:${PORT}" -t .
