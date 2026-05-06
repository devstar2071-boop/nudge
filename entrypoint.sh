#!/bin/sh

# Start the Vertex AI proxy backend (port 5000)
# We don't use --env-file here because we expect env vars from the container environment
echo "Starting Vertex AI Backend..."
cd /app/backend
node server.js &

# Start the BigQuery API backend (port 3001)
echo "Starting BigQuery API Backend..."
cd /app/frontend
# Use tsx to run the TypeScript server directly for simplicity in this prototype
# In a true production app, this would be compiled to JS.
npx tsx server/index.ts &

# Start Nginx in the foreground
echo "Starting Nginx..."
nginx -g 'daemon off;'
