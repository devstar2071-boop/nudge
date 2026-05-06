# Stage 1: Build stage
FROM node:20-slim AS builder
WORKDIR /app

# Copy root and workspace package files
COPY package*.json ./
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install all dependencies (including devDependencies for building)
RUN npm install

# Copy the rest of the source code
COPY . .

# Build the frontend
RUN npm run build --prefix frontend

# Stage 2: Production stage
FROM nginx:stable-alpine

# Install Node.js and npm in the Nginx image
RUN apk add --no-cache nodejs npm

WORKDIR /app

# Copy built frontend assets to Nginx html directory
COPY --from=builder /app/frontend/dist /usr/share/nginx/html

# Copy backend and frontend server code
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/server ./frontend/server
COPY --from=builder /app/frontend/package.json ./frontend/package.json
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy and prepare entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Install production dependencies for the backend and frontend server
# We also install 'tsx' globally to run the TypeScript BigQuery server
RUN npm install --omit=dev && \
    npm install --omit=dev --prefix backend && \
    npm install --omit=dev --prefix frontend && \
    npm install -g tsx

# Expose port 80 for Nginx
EXPOSE 80
EXPOSE 8080

# Default environment variables (should be overridden at runtime)
ENV API_BACKEND_PORT=5000
ENV API_BACKEND_HOST=127.0.0.1
ENV BQ_API_PORT=3001
ENV API_PAYLOAD_MAX_SIZE=7mb

# Start the application via the entrypoint script
ENTRYPOINT ["/entrypoint.sh"]
