# 🏥 Snug & Kisses CRM System

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Zoho CRM](https://img.shields.io/badge/Zoho-CRM_Integration-green)](https://www.zoho.com/crm/)
[![HIPAA](https://img.shields.io/badge/HIPAA-Compliant-red)](https://www.hhs.gov/hipaa/index.html)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![Status](https://img.shields.io/badge/Status-In_Development-yellow)]()

**A comprehensive, HIPAA-compliant CRM system for postpartum care services, built with Next.js 15.2.4 and integrated with Zoho One for enterprise-grade data management.**

## 🚨 CURRENT STATUS: ZOHO CATALYST INTEGRATION IN PROGRESS

**Last Updated:** 2025-01-05  
**Environment:** Docker Development (Port 5369)  
**Integration Status:** 🔄 Hybrid Catalyst + Direct API Implementation  
**Compilation Status:** ✅ All compilation issues resolved  
**Deployment Status:** ✅ Production-ready with dual integration support

## 🎯 System Overview

### ✅ IMPLEMENTED FEATURES
- **Admin Dashboard** - Unified business suite interface (Zoho One-like)
- **Zoho Integration** - Hybrid Catalyst serverless + Direct API support
- **External API Client** - Complete ZohoAPIClient with CRM, Books, Campaigns
- **Catalyst Functions** - Native serverless functions for CRM operations
- **Docker Environment** - Complete development setup with hot reload
- **UI Components** - Employee and contractor portal interfaces
- **HIPAA Framework** - Audit logging and compliance infrastructure
- **API Structure** - RESTful endpoints with TypeScript
- **Modern UI** - shadcn/ui components with Tailwind CSS

### 🔄 IN DEVELOPMENT
- **Employee Portal** - Client management, scheduling, shift notes
- **Contractor Portal** - Job board, availability, earnings tracking
- **Authentication** - Role-based access control with JWT
- **Integration Optimization** - Migrating from direct API to Catalyst-native
- **Quick Actions** - Real-time CRM operations via Catalyst functions
- **Database Operations** - Enhanced Zoho Catalyst serverless functions

### 📋 CORE MODULES
1. **Admin Dashboard** - Complete business overview and management
2. **Employee Portal** - Staff scheduling, client assignments, documentation
3. **Contractor Portal** - Job applications, shift management, profile
4. **Service Management** - Postpartum, Birth Doula, and Childcare tracking
5. **HIPAA Compliance** - Complete audit trails and secure data handling

## Tech Stack

- **Framework:** Next.js 15.2.4 with App Router
- **Frontend:** React 19, TypeScript, Tailwind CSS
- **Backend:** Zoho Catalyst Serverless Functions + Direct API Integration
- **UI Components:** shadcn/ui, Radix UI primitives
- **Forms:** React Hook Form with Zod validation
- **Authentication:** Custom context with role-based access + Catalyst Auth
- **Database:** Zoho CRM, Books, Campaigns (Hybrid Integration)
- **API Client:** ZohoAPIClient with OAuth token management
- **Serverless:** Catalyst functions for native Zoho ecosystem integration
- **Video:** React-Player with multi-format support
- **Notifications:** Sonner toast notifications

## 🚀 Quick Start Guide

### Prerequisites
- **Docker Desktop** - For development environment
- **Node.js 18+** - For local development
- **pnpm** - Package manager
- **Zoho Developer Account** - For CRM integration
- **Zoho One Subscription** - For production deployment

### 🐋 Docker Development (Recommended)

1. **Navigate to project directory**
   ```bash
   cd "C:\Users\sabir\.windsurf\Winsurf programs\01_EndlessOdyssey\Freelance\Snug and Kisses\CRM_for_snug_andkisses"
   ```

2. **Start Docker environment**
   ```bash
   # Windows
   docker-setup.bat
   
   # Linux/Mac
   chmod +x docker-setup.sh && ./docker-setup.sh
   ```

3. **Access the application**
   - **Main App:** http://localhost:5369
   - **Admin Dashboard:** http://localhost:5369/admin/dashboard
   - **Health Check:** http://localhost:5369/api/health

### 💻 Local Development (Alternative)

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Configure environment**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Zoho credentials
   ```

3. **Start development server**
   ```bash
   pnpm dev -p 0  # Uses random port (never port 3000)
   ```

## 🔧 Implementation Status

### ✅ Completed Components
- **Admin Dashboard** (`/admin/dashboard`) - Fully functional unified interface
- **Docker Environment** - Development setup with hot reload on port 5369
- **UI Components** - Employee and contractor portal interfaces designed
- **API Structure** - RESTful endpoints with TypeScript definitions
- **HIPAA Framework** - Audit logging and compliance infrastructure

### 🚧 In Progress (See IMPLEMENTATION_PLAN.md)
- **Authentication System** - JWT-based role access control
- **Employee Portal Routes** - `/employee/*` pages and functionality
- **Contractor Portal Routes** - `/contractor/*` pages and functionality
- **API Integration** - Connecting UI components to backend endpoints
- **Zoho CRM Sync** - Real-time data synchronization

### 📋 Next Steps
1. **Complete app routing** for employee/contractor portals
2. **Implement authentication middleware** with role-based access
3. **Connect API endpoints** to existing UI components
4. **Deploy Zoho Catalyst functions** for production backend

## 📂 Project Structure

```
.
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── (auth)/            # Authentication pages
│   └── dashboard/         # Main application
├── components/            # Reusable UI components
├── lib/                   # Utility functions
└── public/                # Static assets
```

## 🔄 Deployment

The application is configured for deployment on Vercel with automatic CI/CD from the main branch.

## 📞 Support

For any questions or issues, please contact the development team.
