# Vercel Deployment Guide for Investor Properties NY

This guide provides detailed instructions for deploying the Investor Properties NY application to Vercel, including troubleshooting steps for common issues.

## Prerequisites

1. A Vercel account (https://vercel.com)
2. A GitHub/GitLab/Bitbucket account with the repository
3. Supabase account with configured database
4. All required environment variables

## Environment Variables Setup

You must add the following environment variables in your Vercel project settings:

### Required Environment Variables:
```
# Database Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_DATABASE_URL=your_supabase_database_connection_string

# Session Configuration
SESSION_SECRET=your_secure_session_secret

# JWT Configuration
JWT_SECRET=your_jwt_secret

# Client Configuration
CLIENT_URL=https://your-vercel-app.vercel.app
```

### Optional Environment Variables:
```
# Email Configuration (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key

# PayPal Configuration
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

## Deployment Steps

1. **Push your code to GitHub/GitLab/Bitbucket**
   - Make sure all your changes are committed and pushed

2. **Log in to Vercel Dashboard**
   - Go to https://vercel.com/dashboard

3. **Create a New Project**
   - Click "New Project"
   - Import your Git repository

4. **Configure Project Settings**
   - Framework Preset: Other
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
   - Install Command: `npm install`

5. **Add Environment Variables**
   - Go to the "Environment Variables" section
   - Add all required environment variables from above

6. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

## Troubleshooting Common Issues

### 1. "FUNCTION_INVOCATION_FAILED" Error

This error typically occurs when:

#### Issue A: Server startup in serverless environment
**Solution**: We've created a [vercel-server.ts](file:///D:/New%20folder%20(2)/investor-properties-ny-complete-deployment/main%20app%20project/Investor-Properties-NY/server/vercel-server.ts) file that exports the Express app without starting the server. Vercel handles server initialization.

#### Issue B: Environment variables not set
**Solution**: 
1. Check that all required environment variables are added in Vercel project settings
2. Make sure variable names match exactly
3. Verify that sensitive values are correct

#### Issue C: Database connection issues
**Solution**:
1. Verify your Supabase credentials are correct
2. Check that your Supabase project is not paused
3. Ensure your database connection string is properly formatted

### 2. Database Connection Issues

#### Special Characters in Passwords
If your database password contains special characters like `@`, `#`, etc., they must be URL-encoded:
- `@` becomes `%40`
- `#` becomes `%23`
- `/` becomes `%2F`

Example:
```
# Incorrect
postgresql://user:pass@word@host:port/db

# Correct
postgresql://user:pass%40word@host:port/db
```

### 3. Build Failures

#### TypeScript Compilation Errors
**Solution**:
1. Run `npm run build` locally to check for errors
2. Fix any TypeScript errors before deploying

#### Missing Dependencies
**Solution**:
1. Check that all dependencies are in package.json
2. Run `npm install` locally to ensure package-lock.json is up to date

## Vercel-Specific Configuration

### vercel.json
This file configures how Vercel builds and deploys your application:
- Uses `@vercel/node` to run the Node.js server
- Routes all requests through the server
- Includes necessary files for the build

### Server Configuration
The server is configured to work in a serverless environment:
- No explicit server.listen() calls
- Environment-based configuration
- Proper error handling

## Monitoring and Logs

To debug deployment issues:

1. **Vercel Logs**
   - Go to your project in Vercel dashboard
   - Click on the failed deployment
   - View detailed logs in the "Functions" tab

2. **Local Testing**
   - Test locally with `npm run dev:win`
   - Check that all environment variables are properly set

3. **Health Check Endpoint**
   - Visit `/api/health` to check if the API is working
   - This endpoint shows database connection status

## Common Environment Variable Values

For a typical setup, use these values:

```
NODE_ENV=production
SESSION_SECRET=investor_properties_ny_session_secret_2024
JWT_SECRET=investor_properties_ny_jwt_secret_2024
CLIENT_URL=https://your-app.vercel.app
```

## Support

If you continue to experience issues:

1. Check the Vercel deployment logs for specific error messages
2. Verify all environment variables are correctly set
3. Ensure your Supabase database is properly configured
4. Test locally before deploying to Vercel

For additional help, please provide:
- Vercel deployment logs
- Environment variable configuration (without sensitive values)
- Any specific error messages you're seeing