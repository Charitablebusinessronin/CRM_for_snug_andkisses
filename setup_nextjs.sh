#!/bin/bash
set -e

echo "=== Setting up Next.js application ==="

# Navigate to the project directory
cd "C:\Users\SabirAsheed\Development\Dev-Environment\Projects\NextJS\v0\snugsquad\snugsquad\web"

echo "Current directory: $(pwd)"

# Check if the directory exists and contains package.json
if [ ! -f "package.json" ]; then
    echo "Error: package.json not found in current directory"
    ls -la
    exit 1
fi

echo "Found package.json, proceeding with setup..."

# Clear Next.js cache
echo "Clearing Next.js cache..."
rm -rf .next 2>/dev/null || true
rm -rf node_modules/.cache 2>/dev/null || true

# Install dependencies
echo "Installing dependencies..."
npm install --verbose

echo "Dependencies installed successfully!"

# Check if we can build the project
echo "Testing build process..."
npm run build

echo "Build successful! Starting development server..."

# Start the development server
npm run dev
