#!/usr/bin/env bash
set -euo pipefail
HOST="${1:-127.0.0.1}"
PORT="${2:-8080}"

echo "Starting FAST server at http://${HOST}:${PORT}"
exec php \
  -d expose_php=0 \
  -d output_buffering=4096 \
  -d opcache.enable_cli=1 \
  -S "${HOST}:${PORT}" router.php
