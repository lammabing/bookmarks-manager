#!/bin/bash

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Change to the script's directory (assumes package.json is here for npm run)
cd "$SCRIPT_DIR"

# Start application components:
# 1. Kill any processes using the app ports
npx kill-port 5015
npx kill-port 5170

# 2. Start MongoDB (delegated to start-mongo-reliable.sh for robust Docker handling)
"$SCRIPT_DIR/start-mongo-reliable.sh"

# 3. Start backend + frontend dev servers
npm run dev:full

