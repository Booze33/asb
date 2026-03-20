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

# Install dumb-init for proper signal handling and postgresql-client for wait script
RUN apk add --no-cache dumb-init postgresql-client

# Create app user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy server files
COPY --from=server-builder /app/server ./server/
COPY --from=server-builder /app/server/package*.json ./server/

# Copy and make wait script executable
COPY server/wait-for-db.sh ./wait-for-db.sh
RUN chmod +x ./wait-for-db.sh

# Build the server (compile TypeScript)
RUN npm install --prefix server --only=production && \
    npm run build --prefix server

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application with database wait
CMD ["dumb-init", "./wait-for-db.sh", "node", "server/dist/index.js"]
