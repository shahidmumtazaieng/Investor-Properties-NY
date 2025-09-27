# Admin Portal Setup Guide

## Overview
This guide will help you set up and access the Admin Portal for the Investor Properties NY platform.

## Initial Setup

### 1. Create Admin User
Run the admin user creation script to set up the default admin account:

```bash
cd server
npx ts-node create-admin.ts
```

This will create an admin user with the following default credentials:
- Username: `admin`
- Password: `admin123`

### 2. Change Default Credentials
For security reasons, you should change the default admin credentials immediately after first login.

## Accessing the Admin Portal

### 1. Navigate to Admin Login
Visit the admin login page:
```
http://localhost:3000/admin/login
```

### 2. Login with Admin Credentials
Use the default credentials (or your updated credentials):
- Username: `admin`
- Password: `admin123`

### 3. Admin Dashboard
After successful login, you will be redirected to the admin dashboard at:
```
http://localhost:3000/admin/dashboard
```

## Admin Portal Features

### Dashboard
The main dashboard provides an overview of key platform metrics:
- Total users
- Pending approvals
- Active properties
- Total revenue

### User Management
Manage all users in the system:
- View all users
- Filter by user type and status
- Approve pending users
- Edit user information

URL: `/admin/users`

### Property Approval
Review and manage property listings:
- View all property submissions
- Approve or reject pending properties
- Filter by status

URL: `/admin/properties`

### Analytics
View detailed platform analytics:
- User registration trends
- Revenue overview
- Property listing statistics
- User distribution

URL: `/admin/analytics`

### Email Campaigns
Send newsletters and announcements:
- Create new email campaigns
- Select recipient groups
- Use email templates
- View campaign history

URL: `/admin/campaigns`

### Security Monitoring
Monitor security events:
- View login attempts
- Identify suspicious activity
- Resolve security issues
- Monitor active sessions

URL: `/admin/security`

## Security Best Practices

### 1. Change Default Credentials
Immediately change the default admin username and password after first login.

### 2. Use Strong Passwords
Ensure the admin account uses a strong, unique password:
- At least 12 characters
- Mix of uppercase, lowercase, numbers, and symbols
- Not used for any other accounts

### 3. Regular Monitoring
Regularly check the security monitoring section for:
- Failed login attempts
- Suspicious activity
- Unusual user behavior

### 4. Session Management
Log out of the admin portal when not in use, especially on shared or public computers.

## Troubleshooting

### Cannot Access Admin Login
- Ensure the server is running
- Check that the admin routes are properly configured
- Verify the admin user exists in the database

### Login Failed
- Double-check username and password
- Ensure the admin user was created successfully
- Check server logs for authentication errors

### Missing Admin Features
- Verify all admin components were built correctly
- Check that admin routes are properly configured in the server
- Ensure the admin user has the correct userType

## Support
For additional help with the admin portal, please contact the development team or refer to the main documentation.