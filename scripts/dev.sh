#!/bin/bash
# Local dev server with __SITE__ placeholder replacement
set -e

cd "$(dirname "$0")/.."

# Replace __SITE__ placeholder with localhost URL for local metadata
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' 's|__SITE__|http://localhost:3000|g' index.html
else
  sed -i 's|__SITE__|http://localhost:3000|g' index.html
fi

# Restore __SITE__ on exit so the file stays clean for production
restore() {
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's|http://localhost:3000|__SITE__|g' index.html
  else
    sed -i 's|http://localhost:3000|__SITE__|g' index.html
  fi
}
trap restore EXIT INT TERM

npx serve -l 3000
