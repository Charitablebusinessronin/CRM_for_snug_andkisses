# ============================================================================
# SABIR'S TYPESCRIPT CRM API - PRODUCTION DOCKER BUILD
# Healthcare CRM with HIPAA Compliance and Zoho Integration
# ============================================================================

# Use official Node.js 18 LTS Alpine image for security and size optimization
FROM node:18-alpine AS base

# Install system dependencies needed for native modules and Catalyst SDK
RUN apk add --no-cache \
    curl \
    python3 \
    make \
    g++ \
    linux-headers

WORKDIR /app

# ============================================================================
# DEPENDENCIES STAGE - Install production dependencies with critical fixes
# ============================================================================
FROM base AS deps
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# Install production dependencies including the critical https-proxy-agent fix
RUN npm ci --only=production && \
    npm list https-proxy-agent || npm install https-proxy-agent && \
    npm cache clean --force

# ============================================================================
# BUILD STAGE - Compile TypeScript application with all dependencies
# ============================================================================
FROM base AS build
WORKDIR /app

# Copy package files and install all dependencies (including dev)
COPY package*.json ./
COPY tsconfig.json ./

# Install all dependencies for build including dev dependencies
RUN npm ci && \
    npm list https-proxy-agent || npm install https-proxy-agent && \
    npm cache clean --force

# Copy source code and build
COPY src ./src
RUN npm run build

# Verify build completed successfully
RUN ls -la dist/

# ============================================================================
# PRODUCTION RUNTIME STAGE - Create secure, minimal runtime image
# ============================================================================
FROM base AS runner
WORKDIR /app

# Create non-root user for security (HIPAA compliance)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Create necessary directories with proper permissions for HIPAA logging
RUN mkdir -p /app/logs /app/uploads /app/temp && \
    chown -R nodejs:nodejs /app

# Set production environment variables
ENV NODE_ENV=production
ENV PORT=4728
ENV HIPAA_AUDIT_LOGGING=true

# Copy production dependencies from deps stage
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy built application from build stage
COPY --from=build --chown=nodejs:nodejs /app/dist ./dist

# Copy additional configuration files if they exist
COPY --chown=nodejs:nodejs catalyst-config.json* ./

# Switch to non-root user for security
USER nodejs

# Expose the application port
EXPOSE 4728

# Add comprehensive health check for container orchestration
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:4728/health || exit 1

# Add metadata labels for container management
LABEL maintainer="Sabir Asheed" \
      version="1.0.0" \
      description="TypeScript CRM API with HIPAA compliance and Zoho integration" \
      service="backend" \
      port="4728" \
      hipaa-compliant="true"

# Start the application
CMD ["node", "dist/index.js"]
