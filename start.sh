#!/bin/bash

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"

# Change to the script's directory (assumes package.json is here for npm run)
cd "$SCRIPT_DIR"

# Now run your commands
npx kill-port 5015
npx kill-port 5170
/mnt/g/www/bookmarks/start-mongo.sh
npm run dev:full

