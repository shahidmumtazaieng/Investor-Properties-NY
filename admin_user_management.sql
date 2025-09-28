-- Admin User Management SQL Schema
-- This file contains the complete schema for user management in the admin panel
-- It aligns with the application's user management features and integrates with the existing database structure

-- Create Admin Users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    password_reset_token TEXT,
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Admin Sessions table
CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.admin_users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON public.admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON public.admin_sessions(admin_id);

-- Create a view to get all users with their types for admin panel display
CREATE OR REPLACE VIEW public.all_users_view AS
SELECT 
    id,
    username,
    email,
    first_name,
    last_name,
    'admin' as user_type,
    is_active as status,
    created_at
FROM public.admin_users
UNION ALL
SELECT 
    id,
    username,
    email,
    first_name,
    last_name,
    'common_investor' as user_type,
    is_active as status,
    created_at
FROM public.common_investors
UNION ALL
SELECT 
    id,
    email as username,
    email,
    person_name as first_name,
    '' as last_name,
    'institutional_investor' as user_type,
    is_active as status,
    created_at
FROM public.institutional_investors
UNION ALL
SELECT 
    id,
    username,
    email,
    first_name,
    last_name,
    'seller' as user_type,
    is_active as status,
    created_at
FROM public.partners;

-- Create a function to get user count by type for admin dashboard
CREATE OR REPLACE FUNCTION public.get_user_counts_by_type()
RETURNS TABLE(
    user_type TEXT,
    count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'admin'::TEXT as user_type, COUNT(*) as count FROM public.admin_users
    UNION ALL
    SELECT 'common_investor'::TEXT as user_type, COUNT(*) as count FROM public.common_investors
    UNION ALL
    SELECT 'institutional_investor'::TEXT as user_type, COUNT(*) as count FROM public.institutional_investors
    UNION ALL
    SELECT 'seller'::TEXT as user_type, COUNT(*) as count FROM public.partners;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get active users count
CREATE OR REPLACE FUNCTION public.get_active_users_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (
        SELECT 
            (SELECT COUNT(*) FROM public.admin_users WHERE is_active = true) +
            (SELECT COUNT(*) FROM public.common_investors WHERE is_active = true) +
            (SELECT COUNT(*) FROM public.institutional_investors WHERE is_active = true) +
            (SELECT COUNT(*) FROM public.partners WHERE is_active = true)
    );
END;
$$ LANGUAGE plpgsql;

-- Create audit log table for user management actions
CREATE TABLE IF NOT EXISTS public.user_management_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.admin_users(id),
    action TEXT NOT NULL, -- CREATE, UPDATE, DELETE, ACTIVATE, DEACTIVATE
    user_id UUID,
    user_type TEXT, -- admin, common_investor, institutional_investor, seller
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for audit log
CREATE INDEX IF NOT EXISTS idx_user_management_audit_log_admin_id ON public.user_management_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_user_management_audit_log_created_at ON public.user_management_audit_log(created_at);

-- Insert default admin user (uncomment to use)
-- INSERT INTO public.admin_users (username, password, email, first_name, last_name, is_active)
-- VALUES ('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PZvO.S', 'admin@investorpropertiesny.com', 'Admin', 'User', true)
-- ON CONFLICT (username) DO NOTHING;

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_users TO your_app_role;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_sessions TO your_app_role;
-- GRANT SELECT ON public.all_users_view TO your_app_role;
-- GRANT EXECUTE ON FUNCTION public.get_user_counts_by_type() TO your_app_role;
-- GRANT EXECUTE ON FUNCTION public.get_active_users_count() TO your_app_role;
-- GRANT SELECT, INSERT ON public.user_management_audit_log TO your_app_role;

-- Sample queries for admin panel functionality:

-- Get all users for admin panel
-- SELECT * FROM public.all_users_view ORDER BY created_at DESC;

-- Get user counts by type for dashboard
-- SELECT * FROM public.get_user_counts_by_type();

-- Get total active users
-- SELECT public.get_active_users_count() as active_users;

-- Get recent user management activities
-- SELECT a.*, u.username as admin_username 
-- FROM public.user_management_audit_log a
-- JOIN public.admin_users u ON a.admin_id = u.id
-- ORDER BY a.created_at DESC
-- LIMIT 50;

-- Deactivate a user (example for common investor)
-- UPDATE public.common_investors 
-- SET is_active = false, updated_at = NOW() 
-- WHERE id = 'some-user-id';

-- Activate a user (example for institutional investor)
-- UPDATE public.institutional_investors 
-- SET is_active = true, updated_at = NOW() 
-- WHERE id = 'some-investor-id';

-- Create admin user with proper password hashing (to be used in application code)
-- INSERT INTO public.admin_users (username, password, email, first_name, last_name, is_active)
-- VALUES ('newadmin', crypt('newpassword', gen_salt('bf')), 'newadmin@example.com', 'New', 'Admin', true);