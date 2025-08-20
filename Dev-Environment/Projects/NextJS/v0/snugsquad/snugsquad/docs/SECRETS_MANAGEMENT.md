# Secrets Management Strategy

This document outlines how we will manage secrets and environment variables across our different environments.

## Required Environment Variables

The following variables are required for the application to run:

*   `CATALYST_PROJECT_ID`
*   `CATALYST_ENVIRONMENT_ID`
*   `CATALYST_OAUTH_CLIENT_ID`
*   `CATALYST_OAUTH_CLIENT_SECRET`
*   `HIPAA_ENCRYPTION_KEY`
*   `ZOHO_REGION`

## Environment-Specific Instructions

### Local Development

For local development, we will use a `.env.local` file in the root of the project. This file should **never** be committed to git.

To get started, create a file named `.env.local` and add the following content, filling in the values for your local environment:

```
CATALYST_PROJECT_ID=your_project_id
CATALYST_ENVIRONMENT_ID=your_environment_id
CATALYST_OAUTH_CLIENT_ID=your_client_id
CATALYST_OAUTH_CLIENT_SECRET=your_client_secret
HIPAA_ENCRYPTION_KEY=your_hipaa_key
ZOHO_REGION=us
```

### Replit (Staging & Production)

For our deployed environments on Replit, we will use Replit Secrets to manage our environment variables.

**To set a secret in Replit:**

1.  Open the project in Replit.
2.  Go to the "Secrets" tab in the left sidebar.
3.  Add each of the required environment variables and their corresponding values.

These secrets will be automatically injected into the environment when the application is run.

### Zoho Catalyst (Backend Functions)

For our serverless functions on Zoho Catalyst, we will configure the environment variables in the Catalyst console.

**To set an environment variable in Catalyst:**

1.  Open the Zoho Catalyst console.
2.  Navigate to your project.
3.  Go to the "Settings" section and find the "Environment Variables" configuration.
4.  Add each of the required environment variables for the specific environment (e.g., `development` or `production`).
