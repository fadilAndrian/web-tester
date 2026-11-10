# Base image with Node.js and Playwright pre-requisite system libraries
FROM mcr.microsoft.com/playwright:v1.50.0-jammy

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0
ENV FORCE_HEADLESS=true

# Copy package descriptors
COPY package*.json ./

# Install all dependencies (including devDependencies needed for Vite build)
RUN npm ci

# Copy project files
COPY . .

# Build Vite frontend assets for Web Server distribution
RUN npm run build:web

# Clean up devDependencies to keep container lightweight
RUN npm prune --production

# Expose server HTTP port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Start QA Flow Studio backend server
CMD ["node", "server.cjs"]
