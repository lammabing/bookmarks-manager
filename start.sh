#!/bin/bash

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Change to the script's directory (assumes package.json is here for npm run)
cd "$SCRIPT_DIR"

# Start application components:
# 1. Kill any processes using the app ports
npx kill-port 5015
npx kill-port 5170
npx kill-port 5050

# 2. Start MongoDB (delegated to start-mongo-reliable.sh for robust Docker handling)
"$SCRIPT_DIR/start-mongo-reliable.sh"

# 3. Start HTTPS proxy for mobile testing (if @sprisa/localhost is installed)
if command -v localhost &> /dev/null; then
  echo "Starting HTTPS proxy for mobile access..."
  echo "  → https://local.svc.host:5050  (local machine)"
  echo "  → https://<lan-ip>.svc.host:5050  (LAN / mobile devices)"
  localhost 5170 -a &>/tmp/localhost.log &
  LOCALHOST_PID=$!
  echo "  Proxy PID: $LOCALHOST_PID"
else
  echo "Skipping HTTPS proxy (install with: npm i -g @sprisa/localhost)"
  echo "Mobile testing via Web Share Target requires HTTPS."
fi

# 4. Start backend + frontend dev servers
npm run dev:full

