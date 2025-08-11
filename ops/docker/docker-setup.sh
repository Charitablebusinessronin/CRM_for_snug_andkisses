#!/bin/bash

echo "========================================"
echo "Snugs & Kisses CRM - Docker Setup"
echo "Enhanced by Priya Sharma for Sprint 3"
echo "Phase 1-6 Zoho Integration Ready"
echo "========================================"
echo ""
echo "🎯 SPRINT 3 EMERGENCY - PHASE 1-6 COMPLETION"
echo "Current Progress: 65% Complete"
echo "Deadline: TODAY 5 PM"
echo "Remaining: Lead capture automation, Interview scheduling UI"

echo ""
echo "Building Docker containers..."
docker-compose build

echo ""
echo "Starting development environment..."
docker-compose up -d

echo ""
echo "Waiting for services to be ready..."
sleep 15

echo ""
echo "Validating service health..."

# Check if main application is responding
if curl -f -s http://localhost:5369/api/health > /dev/null 2>&1; then
    echo "✅ CRM Application: Healthy"
else
    echo "⚠️  CRM Application: Starting... (may take a few more seconds)"
fi

# Check PostgreSQL connection
if docker-compose exec -T postgres pg_isready -U crm_user > /dev/null 2>&1; then
    echo "✅ PostgreSQL: Ready"
else
    echo "⚠️  PostgreSQL: Initializing..."
fi

# Check Redis connection
if docker-compose exec -T redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis: Connected"
else
    echo "⚠️  Redis: Starting..."
fi

echo ""
echo "🔍 ZOHO INTEGRATION ENVIRONMENT CHECK:"

# Check if Catalyst CLI is available
if command -v catalyst >/dev/null 2>&1; then
    echo "✅ Catalyst CLI: $(catalyst --version 2>/dev/null || echo 'Available but not authenticated')"
else
    echo "⚠️  Catalyst CLI: Not installed - run 'npm install -g @zohocorp/catalyst-cli'"
fi

# Check for required environment variables
if docker-compose exec -T snugs-kisses-crm printenv | grep -q "ZOHO"; then
    echo "✅ Zoho Environment Variables: Configured"
else
    echo "⚠️  Zoho Environment Variables: Missing - check .env file"
fi

# Validate Node.js environment
if docker-compose exec -T snugs-kisses-crm node --version > /dev/null 2>&1; then
    NODE_VERSION=$(docker-compose exec -T snugs-kisses-crm node --version 2>/dev/null)
    echo "✅ Node.js Environment: $NODE_VERSION"
else
    echo "⚠️  Node.js Environment: Container not ready"
fi

echo ""
echo "Checking container status..."
docker-compose ps

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Application is available at:"
echo "  http://localhost:5369"
echo ""
echo "Demo Accounts:"
echo "  ADMIN:      admin@snugandkisses.demo / SecureDemo2025!"
echo "  CONTRACTOR: contractor@snugandkisses.demo / SecureDemo2025!"
echo "  CLIENT:     client@snugandkisses.demo / SecureDemo2025!"
echo "  EMPLOYEE:   employee@snugandkisses.demo / SecureDemo2025!"
echo ""
echo "Services:"
echo "  - CRM Application: http://localhost:5369"
echo "  - Health Check:    http://localhost:5369/api/health"
echo "  - Login Page:      http://localhost:5369/auth/signin"
echo "  - PostgreSQL:      localhost:5432"
echo "  - Redis:           localhost:6379"
echo ""
echo "Development Environment Status:"
echo "  Container Status: docker-compose ps"
echo "  Application Logs: docker-compose logs -f snugs-kisses-crm"
echo "  Database Logs:    docker-compose logs -f postgres"
echo "  Redis Logs:       docker-compose logs -f redis"
echo ""
echo "Sprint 3 Development Commands:"
echo "  Install deps:     docker-compose exec snugs-kisses-crm npm install"
echo "  Run dev server:   docker-compose exec snugs-kisses-crm npm run dev"
echo "  Run tests:        docker-compose exec snugs-kisses-crm npm test"
echo "  Database shell:   docker-compose exec postgres psql -U crm_user -d snugs_kisses_crm"
echo "  Redis CLI:        docker-compose exec redis redis-cli"
echo ""
echo "Container Management:"
echo "  Stop all:         docker-compose down"
echo "  Restart all:      docker-compose restart"
echo "  Rebuild:          docker-compose down && docker-compose build && docker-compose up -d"
echo "  Clean rebuild:    docker-compose down -v && docker-compose build --no-cache && docker-compose up -d"
echo ""
echo "Zoho Integration Testing:"
echo "  API Health:       curl http://localhost:5369/api/health"
echo "  Zoho Webhook:     curl http://localhost:5369/api/webhooks/zoho"
echo "  Auth Status:      curl http://localhost:5369/api/auth/status"
echo ""
echo "🚨 PRIYA'S SPRINT 3 PHASE 1-6 COMMANDS (65% Complete - Due 5 PM TODAY):"
echo "  Zoho Forms Test:     curl -X POST http://localhost:5369/api/zoho/forms/lead-capture"
echo "  Booking Calendar:    curl http://localhost:5369/api/zoho/bookings/interview-slots"
echo "  Doula Selection:     curl http://localhost:5369/api/zoho/crm/doulas/available"
echo "  Email Sequences:     curl http://localhost:5369/api/zoho/campaigns/automated"
echo "  Workflow Status:     curl http://localhost:5369/api/zoho/flow/phase1-6-status"
echo ""
echo "🔧 ZOHO CATALYST CLI COMMANDS:"
echo "  Check CLI:           catalyst --version"
echo "  Login Status:        catalyst auth:status"
echo "  Deploy Function:     catalyst deploy --env development"
echo "  Function Logs:       catalyst logs --function lead-capture"
echo "  Database Query:      catalyst db:query --table clients"
echo ""
echo "⚡ QUICK DEVELOPMENT SETUP:"
echo "  Start Dev Mode:      docker-compose exec snugs-kisses-crm npm run dev:zoho"
echo "  Run Zoho Tests:      docker-compose exec snugs-kisses-crm npm run test:zoho"
echo "  Watch Webhooks:      docker-compose exec snugs-kisses-crm npm run webhook:monitor"
echo "  Build for Prod:      docker-compose exec snugs-kisses-crm npm run build:zoho"
echo ""
echo "📊 SPRINT 3 PROGRESS TRACKING:"
echo "  Current Status:      65% Complete (Phase 1-6)"
echo "  Deadline:           TODAY 5 PM"
echo "  Remaining Work:      Lead capture automation, Interview scheduling UI"
echo "========================================"