# Simple Dockerfile for DPQL - Frontend + Backend
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache dumb-init

# Copy package files
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/frontend/package.json ./apps/frontend/

# Install all dependencies
RUN npm install --workspaces --include-workspace-root

# Copy source code
COPY apps/backend/src ./apps/backend/src
COPY apps/backend/tsconfig.json ./apps/backend/
COPY apps/frontend/src ./apps/frontend/src
COPY apps/frontend/index.html ./apps/frontend/
COPY apps/frontend/tsconfig.json ./apps/frontend/
COPY apps/frontend/postcss.config.js ./apps/frontend/
COPY apps/frontend/tailwind.config.js ./apps/frontend/

# Build both applications
RUN npm run build:backend
RUN npm run build:frontend

# Expose ports
EXPOSE 8080 5174

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'npm run dev:all' >> /app/start.sh && \
    chmod +x /app/start.sh

# Start both services
CMD ["dumb-init", "/app/start.sh"]