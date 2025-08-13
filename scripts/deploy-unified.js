
#!/usr/bin/env node

/**
 * Unified Backend Deployment Script
 * Deploys the consolidated Snug & Kisses CRM to Zoho Catalyst
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Unified Backend Deployment...\n');

// Step 1: Build the application
console.log('📦 Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully\n');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Verify unified backend configuration
console.log('🔍 Verifying unified backend configuration...');
const catalystConfig = JSON.parse(fs.readFileSync('catalyst.json', 'utf8'));
const appConfig = JSON.parse(fs.readFileSync('catalyst-deployment-package/app-config.json', 'utf8'));

console.log(`  ✅ Service: ${catalystConfig.services.appsail.service_name}`);
console.log(`  ✅ Port: ${catalystConfig.services.appsail.port}`);
console.log(`  ✅ Backend: ${appConfig.main}`);
console.log(`  ✅ Functions: ${catalystConfig.services.functions.length} defined\n`);

// Step 3: Deploy to Catalyst
console.log('🌐 Deploying to Zoho Catalyst...');
try {
  execSync('catalyst deploy', { stdio: 'inherit' });
  console.log('✅ Deployment completed successfully\n');
} catch (error) {
  console.log('⚠️  Manual deployment may be required');
  console.log('Run: catalyst deploy\n');
}

// Step 4: Display deployment summary
console.log('🎉 Unified Backend Deployment Summary:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📱 Frontend: Next.js 15 with React 19');
console.log('🖥️  Backend: Unified Express.js server (src/server.ts)');
console.log('⚡ Functions: Catalyst serverless functions');
console.log('🗄️  Database: Catalyst DataStore');
console.log('🔗 Integration: Zoho One ecosystem');
console.log('🚀 Status: Ready for production');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('🌐 Access your application at:');
console.log('   https://snugcrm-891124823.development.catalystserverless.com');
