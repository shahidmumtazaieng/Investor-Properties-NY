# Resolving Seller/Partner Registration Network Error

## Problem Analysis

Based on the investigation, the network error when registering a new seller/partner is likely due to one of these issues:

1. **Server Not Running** - The application server may not be active
2. **Database Connection Issues** - The database connection may be failing, causing fallback to demo mode
3. **Port Configuration** - The server might be running on a different port than expected
4. **CORS Issues** - Cross-origin requests may be blocked

## Solution Steps

### Step 1: Start the Application Server

First, ensure the server is running properly:

```bash
# Navigate to the project directory
cd "d:\New folder (2)\investor-properties-ny-complete-deployment\main app project\Investor-Properties-NY"

# Start the development server
npm run dev
```

Expected output:
```
🚀 Server running on port 3002
📱 Environment: development
🌐 Frontend: http://localhost:3000
🔧 API: http://localhost:3002/api
```

### Step 2: Monitor Server Logs for Database Connection

When the server starts, carefully monitor the console output for these key messages:

**Successful Database Connection:**
```
Attempting to connect to database...
Connection string (masked): postgresql://postgres:****@mxjjjoyqkpucrhadezti.supabase.co:5432/postgres
Database connection established successfully
```

**Failed Database Connection (Demo Mode):**
```
Failed to connect to database, running in demo mode: [error details]
Running in demo mode with mock data
```

### Step 3: Verify Database Configuration

Check that your [.env](file:///d:/New%20folder%20(2)/investor-properties-ny-complete-deployment/main%20app%20project/Investor-Properties-NY/.env) file has the correct configuration:

```env
# Ensure FORCE_DEMO_MODE is NOT set to true
# FORCE_DEMO_MODE=true

# Database Connection - Verify these values
SUPABASE_DATABASE_URL=postgresql://postgres:Shahid%40786123@mxjjjoyqkpucrhadezti.supabase.co:5432/postgres
DATABASE_URL=postgresql://postgres:Shahid%40786123@mxjjjoyqkpucrhadezti.supabase.co:5432/postgres
```

**Important:** The `@` symbol in the password must be URL encoded as `%40`.

### Step 4: Test Database Connectivity

Test the database connection externally using a database client:

```bash
# Using psql command line tool
psql "postgresql://postgres:Shahid%40786123@mxjjjoyqkpucrhadezti.supabase.co:5432/postgres"
```

### Step 5: Verify Partners Table Schema

Ensure the partners table exists with the correct schema:

```sql
-- Check if partners table exists
SELECT table_name FROM information_schema.tables WHERE table_name = 'partners';

-- Check partners table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'partners' 
ORDER BY ordinal_position;
```

### Step 6: Test Partner Registration Endpoint

Once the server is running with database connection, test the registration endpoint:

```bash
# Using curl
curl -X POST http://localhost:3002/api/auth/partners/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testpartner123",
    "password": "testpassword123",
    "email": "testpartner123@example.com",
    "firstName": "Test",
    "lastName": "Partner",
    "company": "Test Company",
    "phone": "123-456-7890"
  }'
```

## Expected Behavior After Fix

### Successful Registration Response:
```json
{
  "success": true,
  "message": "Registration successful. Your account is pending approval.",
  "user": {
    "id": "uuid-here",
    "username": "testpartner123",
    "email": "testpartner123@example.com",
    "firstName": "Test",
    "lastName": "Partner",
    "company": "Test Company",
    "userType": "seller"
  },
  "token": "jwt-token-here",
  "requiresApproval": true
}
```

### Database Operations Verification:
1. Data is stored in the PostgreSQL `partners` table
2. Passwords are properly hashed using bcrypt
3. Email and phone verification tokens are generated
4. Account status is set to `pending` by default

## Troubleshooting Common Issues

### Issue 1: "Failed to connect to database" Error
**Cause:** Incorrect database credentials or network connectivity issues
**Solution:**
1. Verify SUPABASE_DATABASE_URL in [.env](file:///d:/New%20folder%20(2)/investor-properties-ny-complete-deployment/main%20app%20project/Investor-Properties-NY/.env) file
2. Ensure password is URL encoded (@ becomes %40)
3. Check network connectivity to Supabase

### Issue 2: CORS Error in Browser
**Cause:** Cross-origin requests blocked by browser security
**Solution:**
1. Ensure CORS is properly configured in [server/index.ts](file:///d:/New%20folder%20(2)/investor-properties-ny-complete-deployment/main%20app%20project/Investor-Properties-NY/server/index.ts)
2. Verify the frontend is running on http://localhost:3000
3. Check that the server allows requests from the frontend origin

### Issue 3: "Registration failed" (500 Internal Server Error)
**Cause:** Database operation failure
**Solution:**
1. Check server logs for specific error messages
2. Verify the partners table schema matches expected structure
3. Ensure the database user has proper permissions

## Verification Checklist

- [ ] Server is running on port 3002
- [ ] Database connection established successfully (not in demo mode)
- [ ] Partners table exists with correct schema
- [ ] Registration endpoint accepts POST requests
- [ ] Data is stored in real database (not mock data)
- [ ] Passwords are properly hashed
- [ ] JWT tokens are generated for successful registrations
- [ ] Account approval workflow is functional

## Final Testing

After implementing the fixes, perform these tests:

1. Register a new seller/partner account
2. Verify the data appears in the database
3. Log in with the new account credentials
4. Check that account status is properly enforced (pending approval)
5. Confirm all data is persisted between server restarts

With these steps, the network error should be resolved and seller/partner registration will work with real database operations instead of demo mode.