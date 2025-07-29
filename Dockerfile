# Snugs & Kisses CRM - Docker Development Environment
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Set environment variables
ENV NODE_ENV=development
ENV PORT=5369
ENV NEXT_TELEMETRY_DISABLED=1

# Install system dependencies
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    libc6-compat

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml* ./

# Install pnpm and dependencies
RUN npm install -g pnpm
RUN pnpm install --no-frozen-lockfile

# Copy application code
COPY . .

# Create logs directory for HIPAA audit logging
RUN mkdir -p logs/hipaa-audit

# Create .env.local if it doesn't exist
RUN if [ ! -f .env.local ]; then \
    echo "# Snugs & Kisses CRM - Docker Environment" > .env.local && \
    echo "NEXTAUTH_URL=http://localhost:5369" >> .env.local && \
    echo "NEXTAUTH_SECRET=docker-super-secret-jwt-key-for-development-minimum-32-characters-long-secure" >> .env.local && \
    echo "NODE_ENV=development" >> .env.local && \
    echo "NEXT_PUBLIC_APP_URL=http://localhost:5369" >> .env.local && \
    echo "HIPAA_CLOUD_BACKUP=false" >> .env.local && \
    echo "SESSION_TIMEOUT=900000" >> .env.local && \
    echo "TOKEN_ROTATION_INTERVAL=86400000" >> .env.local; \
fi

# Expose port
EXPOSE 5369

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5369/api/health || exit 1

# Start development server
CMD ["pnpm", "dev", "--port", "5369"]