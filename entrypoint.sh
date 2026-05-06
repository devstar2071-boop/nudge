#!/bin/sh

# Set default PORT if not provided (Cloud Run provides this)
export PORT=${PORT:-8080}
export BQ_API_PORT=${BQ_API_PORT:-3001}
export API_BACKEND_PORT=${API_BACKEND_PORT:-5000}
echo "Configuring Nginx: Listen=$PORT, BQ_API=$BQ_API_PORT, Vertex_API=$API_BACKEND_PORT"
sed -i "s/%PORT%/$PORT/g" /etc/nginx/conf.d/default.conf
sed -i "s/%BQ_API_PORT%/$BQ_API_PORT/g" /etc/nginx/conf.d/default.conf
sed -i "s/%API_BACKEND_PORT%/$API_BACKEND_PORT/g" /etc/nginx/conf.d/default.conf

# Start the Vertex AI proxy backend (port 5000)
echo "Starting Vertex AI Backend..."
cd /app/backend
# Check for required environment variables for the backend
if [ -z "$GOOGLE_CLOUD_PROJECT" ] || [ -z "$GOOGLE_CLOUD_LOCATION" ]; then
    echo "Warning: GOOGLE_CLOUD_PROJECT or GOOGLE_CLOUD_LOCATION not set. Vertex AI Backend may fail."
fi
node server.js &

# Start the BigQuery API backend
# BQ_API_PORT defaults to 3001 if not set in Dockerfile
echo "Starting BigQuery API Backend on port ${BQ_API_PORT:-3001}..."
cd /app/frontend
npx tsx server/index.ts &

# Start Nginx in the foreground
echo "Starting Nginx..."
nginx -g 'daemon off;'
