# Deployment Guide for Investor Properties NY

This guide explains how to deploy the Investor Properties NY application to Vercel.

## Prerequisites

1. A Vercel account (https://vercel.com)
2. A Supabase account with a configured project
3. All required environment variables

## Vercel Deployment Configuration

The application includes the following Vercel configuration files:

1. `vercel.json` - Main configuration file for Vercel deployment
2. `vercel.env` - Template for environment variables
3. `package.json` - Contains the `vercel-build` script

## Environment Variables

Before deploying, you need to set the following environment variables in your Vercel project settings:

```env
# Database Connection
DATABASE_URL=your-postgresql-connection-string
DIRECT_DATABASE_URL=your-direct-postgresql-connection-string

# Supabase Configuration
SUPABASE_URL=your-supabase-project-url
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_ANON_KEY=your-supabase-anon-key

# Session Configuration
SESSION_SECRET=your-session-secret-key

# JWT Configuration
JWT_SECRET=your-jwt-secret-key

# PayPal Configuration (if used)
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret

# SendGrid Configuration (if used)
SENDGRID_API_KEY=your-sendgrid-api-key

# Admin Credentials
ADMIN_EMAIL=your-admin-email
ADMIN_PASSWORD=your-admin-password
```

## Deployment Steps

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Log in to your Vercel account and create a new project

3. Import your Git repository

4. Configure the project settings:
   - Framework Preset: Other
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. Add all environment variables from `vercel.env` to your Vercel project settings

6. Deploy the project

## Database Configuration

The application is configured to work with Supabase. Make sure you have:

1. Created a Supabase project
2. Set up the database schema using the Drizzle ORM
3. Configured the authentication settings
4. Added the required environment variables to Vercel

## Notes

- The application uses a fallback mechanism that will use demo data if database connections fail
- In production, make sure to disable demo mode by not setting `FORCE_DEMO_MODE=true`
- The application includes health checks at `/api/health` to monitor database connectivity

## Troubleshooting

If you encounter issues during deployment:

1. Check that all environment variables are correctly set
2. Verify database connection strings are correct
3. Ensure the Supabase project is properly configured
4. Check the Vercel build logs for any error messages