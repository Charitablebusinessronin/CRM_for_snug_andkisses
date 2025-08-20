# Multi-stage Dockerfile for Next.js 15.1.8 + React 19.0.0 compatibility
# Optimized for Windows 11 development with proper dependency resolution

# Use Node.js 20 LTS Alpine for security and performance
FROM node:20-alpine AS base

# Install system dependencies required for native modules
RUN apk add --no-cache \
    libc6-compat \
    dumb-init

# Set working directory
WORKDIR /app

# Do not set NODE_ENV here; we need devDependencies during build
ENV NEXT_TELEMETRY_DISABLED=1

# ==========================================
# Dependencies stage - Install dependencies only
# ==========================================
FROM base AS deps

# Copy package files for dependency installation
COPY package.json package-lock.json* ./

# Install full dependencies (including dev) for build tools like Tailwind/PostCSS
RUN npm ci && \
    npm cache clean --force

# ==========================================
# Builder stage - Build the application
# ==========================================
FROM base AS builder

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Create .env.local if it doesn't exist (for build-time variables)
RUN touch .env.local

# Build Next.js application with standalone output
# The standalone output automatically handles dependency optimization
RUN npm run build

# ==========================================
# Runner stage - Production runtime
# ==========================================
FROM base AS runner

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set production environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy public assets
COPY --from=builder /app/public ./public

# Create .next directory with correct permissions
RUN mkdir .next && chown nextjs:nodejs .next

# Copy the standalone server and static files
# Next.js standalone output includes all necessary dependencies
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check for container orchestration (single-line -e script)
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "const http=require('http');const req=http.request({host:'localhost',port:3000,path:'/',timeout:2000},()=>process.exit(0));req.on('error',()=>process.exit(1));req.on('timeout',()=>process.exit(1));req.end();"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the server using the standalone output
CMD ["node", "server.js"]