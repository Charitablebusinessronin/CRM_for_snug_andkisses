
#!/usr/bin/env node

/**
 * Unified Deployment Script for Snug & Kisses CRM
 * Consolidates backend architecture and deploys to Catalyst
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting unified deployment...');

try {
  // Step 1: Clean previous builds
  console.log('📦 Cleaning previous builds...');
  if (fs.existsSync('dist')) {
    execSync('rm -rf dist', { stdio: 'inherit' });
  }
  
  // Step 2: Install dependencies with legacy peer deps to resolve conflicts
  console.log('📥 Installing dependencies...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  
  // Step 3: Build TypeScript backend
  console.log('🔨 Building TypeScript backend...');
  execSync('npx tsc src/server.ts --outDir dist --target ES2020 --module commonjs --esModuleInterop', { stdio: 'inherit' });
  
  // Step 4: Build Next.js frontend
  console.log('🎨 Building Next.js frontend...');
  execSync('npm run build', { stdio: 'inherit' });
  
  // Step 5: Deploy to Catalyst
  console.log('☁️ Deploying to Catalyst...');
  execSync('catalyst deploy', { stdio: 'inherit' });
  
  console.log('✅ Unified deployment completed successfully!');
  console.log('🌐 Your application is now running with a single, optimized backend architecture.');
  
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  process.exit(1);
}
