# Snugs and Kisses CRM

*HIPAA-Compliant Customer Relationship Management System*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/charitablebusinessronins-projects/v0-snugs-and-kisses-crm)
[![HIPAA Compliance](https://img.shields.io/badge/HIPAA-Compliant-blue?style=for-the-badge)](https://www.hhs.gov/hipaa/index.html)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-000000?style=for-the-badge&logo=nextdotjs)](https://nextjs.org/)

## 📋 Project Status

### ✅ Completed
- Project structure and initial setup
- Zoho One integration configuration
- Environment variables configuration
- Basic authentication setup (pending client credentials)
- HIPAA compliance measures

### ⏳ Pending Client Review
- Final Zoho OAuth credentials
- Production environment configuration
- Client-specific customizations

## 🔐 Authentication Status

**Note (2025-07-19):** Awaiting client-provided Zoho OAuth credentials for full authentication implementation. The system is pre-configured but requires client approval and credentials to be fully operational.

## 🏛️ HIPAA Compliance

### Implemented Measures
- Data encryption at rest and in transit
- Secure environment variable management
- Audit logging for all data access
- Role-based access control (RBAC)
- Automatic session timeout
- Secure password policies

### Required Client Actions
1. Sign Business Associate Agreement (BAA) with Zoho
2. Configure Zoho account for HIPAA compliance
3. Provide production credentials for secure setup

## 🚀 Getting Started

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
