#!/bin/bash
# Node.js Global Packages Installation Script

# Log file setup
LOG_DIR="../../Temp/Logs"
LOG_FILE="$LOG_DIR/node-packages-install.log"

# Create log directory if it doesn't exist
mkdir -p $LOG_DIR

# Function to log messages
log_message() {
  local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
  echo "[$timestamp] $1" | tee -a "$LOG_FILE"
}

# Start installation
log_message "Starting Node.js global packages installation..."
log_message "Using Node.js version: $(node -v)"
log_message "Using npm version: $(npm -v)"

# Install global packages
log_message "Installing Next.js..."
npm install -g next

log_message "Installing Shopify CLI..."
npm install -g @shopify/cli @shopify/theme

log_message "Installing WordPress scripts..."
npm install -g @wordpress/scripts

log_message "Installing TypeScript..."
npm install -g typescript

log_message "Installing ESLint and Prettier..."
npm install -g eslint prettier

log_message "Installing Nodemon and PM2..."
npm install -g nodemon pm2

log_message "Installing Serve..."
npm install -g serve

# Verify installations
log_message "Verifying installations..."

# Create verification array
declare -a packages=("next" "shopify" "wp-scripts" "tsc" "eslint" "prettier" "nodemon" "pm2" "serve")

# Check each package
for pkg in "${packages[@]}"; do
  if command -v $pkg &> /dev/null; then
    log_message "✅ $pkg is installed: $(command -v $pkg)"
  else
    log_message "❌ $pkg installation could not be verified"
  fi
done

# Create npm configuration for default ports
log_message "Creating npm configuration for custom ports..."

# Set Next.js default port
npm config set next:port 5001

# Set serve default port
npm config set serve:port 5002

log_message "Node.js global packages installation completed!"
