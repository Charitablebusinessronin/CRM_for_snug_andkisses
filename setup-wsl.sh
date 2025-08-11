#!/bin/bash
# ============================================================================
# WSL ENVIRONMENT SETUP FOR SNUG & KISSES CRM
# ============================================================================

echo "🔧 Setting up WSL environment for CRM development..."

# Update package list
echo "📦 Updating package list..."
sudo apt update

# Install essential tools
echo "🛠️ Installing essential tools..."
sudo apt install -y curl jq git

# Check if Docker is accessible
echo ""
echo "🐳 Checking Docker accessibility..."
if docker --version >/dev/null 2>&1; then
    echo "✅ Docker CLI is available"
    docker --version
else
    echo "❌ Docker CLI not found"
    echo "💡 Install Docker CLI in WSL:"
    echo "   curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "   sudo sh get-docker.sh"
    echo "   sudo usermod -aG docker \$USER"
fi

# Check Docker Compose
echo ""
echo "🔧 Checking Docker Compose..."
if docker compose version >/dev/null 2>&1; then
    echo "✅ Docker Compose (v2) is available"
    docker compose version
elif docker-compose --version >/dev/null 2>&1; then
    echo "✅ Docker Compose (legacy) is available"
    docker-compose --version
else
    echo "❌ Docker Compose not found"
    echo "💡 Install Docker Compose:"
    echo "   sudo apt install docker-compose"
fi

# Test Docker connectivity
echo ""
echo "🔍 Testing Docker connectivity..."
if docker info >/dev/null 2>&1; then
    echo "✅ Docker daemon is accessible from WSL"
else
    echo "❌ Cannot connect to Docker daemon"
    echo "💡 Make sure:"
    echo "   1. Docker Desktop is running on Windows"
    echo "   2. WSL 2 integration is enabled in Docker Desktop settings"
    echo "   3. Your WSL distribution is enabled in Docker Desktop"
    echo "   4. You've restarted WSL after enabling integration"
fi

# Check project directory accessibility
echo ""
echo "📁 Checking project directory accessibility..."
PROJECT_PATH="/mnt/c/Users/SabirAsheed/Development/Dev-Environment/Projects/NextJS/CRM_for_snug_andkisses"
if [ -d "$PROJECT_PATH" ]; then
    echo "✅ Project directory is accessible: $PROJECT_PATH"
    cd "$PROJECT_PATH"
    if [ -f "docker-compose.yml" ]; then
        echo "✅ docker-compose.yml found"
    else
        echo "❌ docker-compose.yml not found in project directory"
    fi
    if [ -f ".env" ]; then
        echo "✅ .env file found"
    else
        echo "❌ .env file not found"
    fi
else
    echo "❌ Cannot access project directory: $PROJECT_PATH"
    echo "💡 Make sure the Windows path exists and WSL can access it"
fi

# Set executable permissions
echo ""
echo "🔐 Setting executable permissions for deployment script..."
chmod +x "$PROJECT_PATH/deploy-wsl.sh" 2>/dev/null && echo "✅ Permissions set" || echo "⚠️ Could not set permissions"

echo ""
echo "============================================================================"
echo "🎯 NEXT STEPS"
echo "============================================================================"
echo "1. Make sure Docker Desktop is running on Windows"
echo "2. Enable WSL 2 integration in Docker Desktop settings"
echo "3. Run the deployment script:"
echo "   cd '$PROJECT_PATH'"
echo "   ./deploy-wsl.sh"
echo ""
echo "🔍 If you encounter issues:"
echo "   - Restart WSL: wsl --shutdown (in Windows CMD)"
echo "   - Restart Docker Desktop"
echo "   - Check Docker Desktop WSL integration settings"
echo "============================================================================"