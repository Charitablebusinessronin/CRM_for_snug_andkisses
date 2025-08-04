# Snugs and Kisses CRM - Local Development Setup Guide

## Prerequisites

Before running the application locally, ensure you have:

- **Node.js** 18+ installed
- **npm** or **pnpm** package manager
- **Git** for version control

## Environment Setup

### 1. Install Dependencies

```bash
cd "C:\Users\sabir\.windsurf\Winsurf programs\01_EndlessOdyssey\Freelance\Snug and Kisses\CRM_for_snug_andkisses"
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the project root:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-jwt-key-here-min-32-chars

# Database URLs (for future use)
DATABASE_URL=your-database-url-here
DIRECT_URL=your-direct-database-url-here

# Zoho API Configuration (for production)
ZOHO_CLIENT_ID=your-zoho-client-id
ZOHO_CLIENT_SECRET=your-zoho-client-secret
ZOHO_REFRESH_TOKEN=your-zoho-refresh-token
ZOHO_CRM_API_URL=https://www.zohoapis.com/crm/v2
ZOHO_BOOKS_API_URL=https://books.zoho.com/api/v3
ZOHO_CAMPAIGNS_API_URL=https://campaigns.zoho.com/api/v1.1

# HIPAA Compliance Settings
HIPAA_CLOUD_BACKUP=false
SESSION_TIMEOUT=900000
TOKEN_ROTATION_INTERVAL=86400000

# Development Settings
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Generate NextAuth Secret

Generate a secure secret for NextAuth:

```bash
openssl rand -base64 32
```

Copy the output and use it for `NEXTAUTH_SECRET` in your `.env.local` file.

## Demo Account Testing

The application includes built-in demo accounts for testing:

### Available Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@snugandkisses.demo | SecureDemo2025! |
| Contractor | contractor@snugandkisses.demo | SecureDemo2025! |
| Client | client@snugandkisses.demo | SecureDemo2025! |
| Employee | employee@snugandkisses.demo | SecureDemo2025! |

## Running the Application

### 1. Development Server

```bash
npm run dev
```

The application will be available at: `http://localhost:3000`

### 2. Build for Production

```bash
npm run build
npm start
```

## Testing Authentication

### 1. Access Login Page

Navigate to: `http://localhost:3000/auth/signin`

### 2. Test Demo Accounts

- Use the "Demo Accounts" tab on the login form
- Click any role button to instantly login as that role
- Each role will redirect to its appropriate dashboard

### 3. Manual Login Testing

- Use the "Login" tab
- Enter any demo account credentials manually
- Test form validation with invalid inputs
- Test account lockout (5 failed attempts)

## Application Structure

### Key Directories

```
├── app/
│   ├── api/auth/           # Authentication API routes
│   ├── auth/signin/        # Login page
│   ├── admin/             # Admin dashboard (protected)
│   ├── contractor/        # Contractor dashboard (protected)
│   ├── client/            # Client dashboard (protected)
│   └── employee/          # Employee dashboard (protected)
├── components/
│   ├── auth/              # Authentication components
│   └── ui/                # Shadcn UI components
├── lib/
│   ├── auth-enhanced.ts   # NextAuth configuration
│   ├── auth-middleware.ts # Route protection
│   ├── token-manager.ts   # Token rotation system
│   └── hipaa-audit.ts     # HIPAA audit logging
└── types/
    └── auth.ts            # Authentication type definitions
```

### Protected Routes

The following routes are automatically protected by role:

- `/admin/*` - Admin only
- `/contractor/*` - Contractor + Admin
- `/client/*` - Client + Admin + Employee
- `/employee/*` - Employee + Admin
- `/api/v1/admin/*` - Admin only (API)
- `/api/v1/contractor/*` - Contractor + Admin (API)

## Security Features

### 1. Session Management
- **15-minute timeout** for HIPAA compliance
- Automatic session renewal on activity
- Secure JWT tokens with role information

### 2. Rate Limiting
- **5 login attempts** per IP address per 15 minutes
- Account lockout for 15 minutes after 5 failed attempts
- Automatic cleanup of rate limit data

### 3. Audit Logging
- All authentication events logged to `/logs/hipaa-audit/`
- Tamper-evident logging with hash chaining
- Real-time security alerting for suspicious activity

### 4. Token Security
- Refresh tokens rotate every 24 hours
- Device fingerprinting for additional security
- Secure token storage with bcrypt hashing

## Troubleshooting

### Common Issues

#### 1. "Cannot find module" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 2. NextAuth configuration errors
- Verify `NEXTAUTH_SECRET` is set and at least 32 characters
- Ensure `NEXTAUTH_URL` matches your local development URL

#### 3. Authentication not working
- Check that all demo account passwords match exactly: `SecureDemo2025!`
- Verify the enhanced login form is being used
- Check browser console for JavaScript errors

#### 4. Protected routes not working
- Ensure middleware is properly configured
- Check that the authentication middleware is running
- Verify user roles are being set correctly in JWT tokens

### Development Tips

#### 1. View Audit Logs
Audit logs are stored in: `./logs/hipaa-audit/audit-YYYY-MM-DD.json`

#### 2. Monitor Authentication Events
Check the console output for real-time authentication events and security alerts.

#### 3. Test Role-Based Access
- Login with different demo accounts
- Try accessing routes meant for other roles
- Verify proper redirects and access denied messages

#### 4. Test Security Features
- Try multiple failed login attempts to trigger account lockout
- Test session timeout by waiting 15 minutes
- Verify token rotation by checking network requests

## Next Steps

### 1. Database Integration
- Set up PostgreSQL or your preferred database
- Configure Prisma or your ORM of choice
- Migrate demo accounts to database storage

### 2. Zoho Integration
- Obtain Zoho API credentials
- Configure OAuth flow for production users
- Test Zoho CRM, Books, and Campaigns integration

### 3. Production Deployment
- Configure production environment variables
- Set up SSL certificates
- Configure production-grade audit logging
- Set up monitoring and alerting

## Support

If you encounter issues during setup:

1. Check this guide for common solutions
2. Verify all environment variables are correctly set
3. Ensure all dependencies are installed
4. Check the browser console and server logs for errors

The authentication system is production-ready and should work seamlessly for local development and testing.