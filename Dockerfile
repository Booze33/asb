# Multi-stage Dockerfile for the fullstack appointment booking system

# Build stage for client
FROM node:18-alpine AS client-builder
WORKDIR /app/client

# Copy package files
COPY client/package*.json ./
RUN npm ci --only=production

# Copy source code
COPY client/ ./

# Build the client
RUN npm run build

# Build stage for server
FROM node:18-alpine AS server-builder
WORKDIR /app/server

# Copy package files
COPY server/package*.json ./
RUN npm ci --only=production

# Copy source code
COPY server/ ./

# Production stage
FROM node:18-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy built client
COPY --from=client-builder /app/client/dist ./client/dist
COPY --from=client-builder /app/client/package*.json ./client/

# Copy server files
COPY --from=server-builder /app/server ./server/
COPY --from=server-builder /app/server/package*.json ./server/

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3008

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3008/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["dumb-init", "node", "server/src/index.js"]