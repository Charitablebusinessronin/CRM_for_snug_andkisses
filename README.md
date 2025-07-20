# Snugs and Kisses CRM System

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Zoho CRM](https://img.shields.io/badge/Zoho-CRM_Integration-green)](https://www.zoho.com/crm/)
[![HIPAA](https://img.shields.io/badge/HIPAA-Compliant-red)](https://www.hhs.gov/hipaa/index.html)

A modern, HIPAA-compliant customer relationship management system built with Next.js and integrated with Zoho One for enterprise-grade data management and security.

## Features

- **Employee Portal** - Comprehensive onboarding with form validation
- **Service Management** - Request tracking for Postpartum, Birth Doula, and Childcare services
- **Video Integration** - Welcome videos with React-Player
- **HIPAA Compliance** - Complete audit logging and secure data storage
- **Zoho Integration** - Direct CRM integration with REST API
- **Role-Based Auth** - Protected routes with authentication context
- **Modern UI** - shadcn/ui components with Tailwind CSS

## Tech Stack

- **Framework:** Next.js 15.2.4 with App Router
- **Frontend:** React 19, TypeScript, Tailwind CSS
- **UI Components:** shadcn/ui, Radix UI primitives
- **Forms:** React Hook Form with Zod validation
- **Authentication:** Custom context with role-based access
- **Database:** Zoho CRM (Leads & Cases modules)
- **Video:** React-Player with multi-format support
- **Notifications:** Sonner toast notifications

## Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Zoho One account with CRM access
- OAuth credentials for Zoho integration

## Quick Start

1. **Clone the repository**
### Prerequisites
- Node.js 18+
- pnpm
- Zoho Developer Account
- Zoho One Subscription

### Local Development

1. Clone the repository
   ```bash
   git clone https://github.com/Charitablebusinessronin/CRM-for-snug-and-kisses-.git
   cd CRM-for-snug-and-kisses-
   ```

2. Install dependencies
   ```bash
   pnpm install
   ```

3. Set up environment variables
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. Start the development server
   ```bash
   pnpm dev -p 0  # Uses a random available port
   ```

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
