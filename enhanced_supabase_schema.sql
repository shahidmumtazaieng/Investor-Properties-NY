-- Enhanced Supabase Database Schema
-- This schema includes additional tables and fields to support password reset functionality
-- and other features needed for the application

-- Existing tables (with some enhancements)
CREATE TABLE public.bid_service_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  foreclosure_listing_id uuid,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  investment_budget text,
  max_bid_amount text,
  investment_experience text,
  preferred_contact_method text,
  timeframe text,
  additional_requirements text,
  status text DEFAULT 'pending'::text,
  assigned_to text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bid_service_requests_pkey PRIMARY KEY (id),
  CONSTRAINT bid_service_requests_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id),
  CONSTRAINT bid_service_requests_foreclosure_listing_id_fkey FOREIGN KEY (foreclosure_listing_id) REFERENCES public.foreclosure_listings(id)
);

CREATE TABLE public.blogs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  excerpt text,
  cover_image text,
  author text NOT NULL,
  tags TEXT[],
  published boolean NOT NULL DEFAULT false,
  published_at timestamp with time zone,
  featured boolean NOT NULL DEFAULT false,
  view_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT blogs_pkey PRIMARY KEY (id)
);

CREATE TABLE public.buyer_leads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  motivation text DEFAULT 'investment'::text,
  timeline text DEFAULT '3-6 months'::text,
  budget text DEFAULT '$100k-$500k'::text,
  preferred_areas TEXT[] DEFAULT '{}'::text[],
  experience_level text DEFAULT 'beginner'::text,
  email_verified boolean NOT NULL DEFAULT false,
  phone_verified boolean NOT NULL DEFAULT false,
  email_verification_token text,
  email_verification_sent_at timestamp with time zone,
  email_verified_at timestamp with time zone,
  phone_verification_code text,
  phone_verification_sent_at timestamp with time zone,
  phone_verified_at timestamp with time zone,
  status text DEFAULT 'active'::text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT buyer_leads_pkey PRIMARY KEY (id)
);

CREATE TABLE public.common_investor_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL,
  session_token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT common_investor_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT common_investor_sessions_investor_id_fkey FOREIGN KEY (investor_id) REFERENCES public.common_investors(id)
);

CREATE TABLE public.common_investors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  email text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  email_verified boolean NOT NULL DEFAULT false,
  email_verification_token text,
  email_verification_sent_at timestamp with time zone,
  email_verified_at timestamp with time zone,
  phone_verified boolean NOT NULL DEFAULT false,
  phone_verification_code text,
  phone_verification_sent_at timestamp with time zone,
  phone_verified_at timestamp with time zone,
  has_foreclosure_subscription boolean NOT NULL DEFAULT false,
  foreclosure_subscription_expiry timestamp with time zone,
  subscription_plan text,
  password_reset_token text,
  password_reset_expires timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT common_investors_pkey PRIMARY KEY (id)
);

CREATE TABLE public.communications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  type text NOT NULL,
  direction text NOT NULL,
  subject text,
  content text,
  status text NOT NULL DEFAULT 'sent'::text,
  scheduled_for timestamp with time zone,
  sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT communications_pkey PRIMARY KEY (id),
  CONSTRAINT communications_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id)
);

CREATE TABLE public.foreclosure_listings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  address text NOT NULL,
  county text NOT NULL,
  neighborhood text,
  borough text,
  auction_date timestamp with time zone NOT NULL,
  starting_bid numeric,
  assessed_value numeric,
  property_type text,
  beds integer,
  baths numeric,
  sqft integer,
  year_built integer,
  description text,
  docket_number text,
  plaintiff text,
  defendant text,
  attorney text,
  attorney_phone text,
  attorney_email text,
  case_number text,
  judgment_amount numeric,
  interest_rate numeric,
  lien_position text,
  property_condition text,
  occupancy_status text,
  redemption_period_end timestamp with time zone,
  sale_type text,
  opening_bid numeric,
  minimum_bid numeric,
  deposit_requirement text,
  sale_terms text,
  property_images TEXT[],
  legal_description text,
  parcel_number text,
  zoning_classification text,
  tax_delinquency_amount numeric,
  hoa_dues numeric,
  utilities text,
  environmental_issues text,
  title_status text,
  title_company text,
  title_company_phone text,
  title_company_email text,
  inspection_report_url text,
  appraisal_report_url text,
  property_documents_url text,
  notes text,
  status text NOT NULL DEFAULT 'upcoming'::text,
  is_active boolean NOT NULL DEFAULT true,
  featured boolean NOT NULL DEFAULT false,
  priority_level integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT foreclosure_listings_pkey PRIMARY KEY (id)
);

CREATE TABLE public.foreclosure_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  counties TEXT[] NOT NULL,
  subscription_type text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  last_sent timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT foreclosure_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT foreclosure_subscriptions_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id)
);

CREATE TABLE public.institutional_bid_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL,
  property_id uuid,
  property_address text NOT NULL,
  bid_amount text NOT NULL,
  auction_date timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'submitted'::text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT institutional_bid_tracking_pkey PRIMARY KEY (id),
  CONSTRAINT institutional_bid_tracking_investor_id_fkey FOREIGN KEY (investor_id) REFERENCES public.institutional_investors(id)
);

CREATE TABLE public.institutional_foreclosure_lists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  week_of_date timestamp with time zone NOT NULL,
  properties jsonb NOT NULL,
  total_properties integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT institutional_foreclosure_lists_pkey PRIMARY KEY (id)
);

CREATE TABLE public.institutional_investors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  person_name text NOT NULL,
  institution_name text NOT NULL,
  job_title text NOT NULL,
  email text NOT NULL UNIQUE,
  work_phone text NOT NULL,
  personal_phone text NOT NULL,
  business_card_url text,
  status text NOT NULL DEFAULT 'pending'::text,
  username text UNIQUE,
  password text,
  is_active boolean DEFAULT false,
  approved_at timestamp with time zone,
  approved_by text,
  last_login_at timestamp with time zone,
  password_reset_token text,
  password_reset_expires timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT institutional_investors_pkey PRIMARY KEY (id)
);

CREATE TABLE public.institutional_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL,
  session_token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT institutional_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT institutional_sessions_investor_id_fkey FOREIGN KEY (investor_id) REFERENCES public.institutional_investors(id)
);

CREATE TABLE public.institutional_weekly_deliveries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL,
  foreclosure_list_id uuid NOT NULL,
  delivered_at timestamp with time zone DEFAULT now(),
  email_sent boolean DEFAULT false,
  CONSTRAINT institutional_weekly_deliveries_pkey PRIMARY KEY (id),
  CONSTRAINT institutional_weekly_deliveries_investor_id_fkey FOREIGN KEY (investor_id) REFERENCES public.institutional_investors(id),
  CONSTRAINT institutional_weekly_deliveries_foreclosure_list_id_fkey FOREIGN KEY (foreclosure_list_id) REFERENCES public.institutional_foreclosure_lists(id)
);

CREATE TABLE public.leads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  source text NOT NULL,
  status text NOT NULL DEFAULT 'new'::text,
  motivation text,
  timeline text,
  budget text,
  preferred_areas TEXT[],
  experience_level text,
  property_details jsonb,
  notes text,
  email_verified boolean NOT NULL DEFAULT false,
  email_verification_token text,
  email_verification_sent_at timestamp with time zone,
  email_verified_at timestamp with time zone,
  phone_verified boolean NOT NULL DEFAULT false,
  phone_verification_code text,
  phone_verification_sent_at timestamp with time zone,
  phone_verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT leads_pkey PRIMARY KEY (id)
);

CREATE TABLE public.offers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  common_investor_id uuid,
  institutional_investor_id uuid,
  buyer_lead_id uuid,
  offer_amount numeric NOT NULL,
  terms text,
  status text NOT NULL DEFAULT 'pending'::text,
  offer_letter_url text,
  proof_of_funds_url text,
  closing_date text,
  down_payment numeric,
  financing_type text,
  contingencies text,
  additional_terms text,
  signed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT offers_pkey PRIMARY KEY (id),
  CONSTRAINT offers_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id),
  CONSTRAINT offers_common_investor_id_fkey FOREIGN KEY (common_investor_id) REFERENCES public.common_investors(id),
  CONSTRAINT offers_institutional_investor_id_fkey FOREIGN KEY (institutional_investor_id) REFERENCES public.institutional_investors(id),
  CONSTRAINT offers_buyer_lead_id_fkey FOREIGN KEY (buyer_lead_id) REFERENCES public.leads(id)
);

CREATE TABLE public.partners (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  email text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  company text,
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  approval_status text NOT NULL DEFAULT 'pending'::text,
  approved_at timestamp with time zone,
  approved_by text,
  rejection_reason text,
  email_verified boolean NOT NULL DEFAULT false,
  email_verification_token text,
  email_verification_sent_at timestamp with time zone,
  email_verified_at timestamp with time zone,
  phone_verified boolean NOT NULL DEFAULT false,
  phone_verification_code text,
  phone_verification_sent_at timestamp with time zone,
  phone_verified_at timestamp with time zone,
  password_reset_token text,
  password_reset_expires timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT partners_pkey PRIMARY KEY (id)
);

CREATE TABLE public.properties (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  address text NOT NULL,
  neighborhood text NOT NULL,
  borough text NOT NULL,
  property_type text NOT NULL,
  beds integer,
  baths numeric,
  sqft integer,
  units integer,
  price numeric NOT NULL,
  arv numeric,
  estimated_profit numeric,
  cap_rate numeric,
  annual_income numeric,
  condition text,
  access text NOT NULL DEFAULT 'Available with Appointment'::text,
  images TEXT[],
  description text,
  google_sheets_row_id text,
  partner_id uuid,
  source text NOT NULL DEFAULT 'internal'::text,
  status text NOT NULL DEFAULT 'available'::text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT properties_pkey PRIMARY KEY (id),
  CONSTRAINT properties_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id)
);

CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  email_verified boolean NOT NULL DEFAULT false,
  email_verification_token text,
  email_verification_sent_at timestamp without time zone,
  email_verified_at timestamp without time zone,
  password_reset_token text,
  password_reset_expires timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

CREATE TABLE public.weekly_subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  counties TEXT[] NOT NULL,
  plan_type text NOT NULL,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  notes text,
  CONSTRAINT weekly_subscribers_pkey PRIMARY KEY (id)
);

-- New tables for enhanced functionality

-- Password reset tokens table for all user types
CREATE TABLE public.password_reset_tokens (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_type text NOT NULL, -- 'common_investor', 'institutional_investor', 'partner', 'admin'
  token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT password_reset_tokens_pkey PRIMARY KEY (id)
);

-- Admin users table
CREATE TABLE public.admin_users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  email text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  last_login_at timestamp with time zone,
  password_reset_token text,
  password_reset_expires timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_users_pkey PRIMARY KEY (id)
);

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

-- Admin sessions table
CREATE TABLE public.admin_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL,
  session_token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT admin_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT admin_sessions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admin_users(id)
);

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

-- Property images table for better image management
CREATE TABLE public.property_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  image_url text NOT NULL,
  is_primary boolean NOT NULL DEFAULT false,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT property_images_pkey PRIMARY KEY (id),
  CONSTRAINT property_images_property_id_fkey FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE CASCADE
);

-- User activity log table
CREATE TABLE public.user_activity_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_type text NOT NULL, -- 'common_investor', 'institutional_investor', 'partner', 'admin'
  action text NOT NULL,
  details jsonb,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_activity_logs_pkey PRIMARY KEY (id)
);

-- Email templates table for consistent communication
CREATE TABLE public.email_templates (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  subject text NOT NULL,
  body text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT email_templates_pkey PRIMARY KEY (id)
);

-- System settings table
CREATE TABLE public.system_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT system_settings_pkey PRIMARY KEY (id)
);

-- Indexes for better performance
CREATE INDEX idx_common_investors_email ON public.common_investors(email);
CREATE INDEX idx_common_investors_username ON public.common_investors(username);
CREATE INDEX idx_institutional_investors_email ON public.institutional_investors(email);
CREATE INDEX idx_partners_email ON public.partners(email);
CREATE INDEX idx_partners_username ON public.partners(username);
CREATE INDEX idx_admin_users_email ON public.admin_users(email);
CREATE INDEX idx_admin_users_username ON public.admin_users(username);
CREATE INDEX idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_admin_id ON public.admin_sessions(admin_id);
CREATE INDEX idx_user_management_audit_log_admin_id ON public.user_management_audit_log(admin_id);
CREATE INDEX idx_user_management_audit_log_created_at ON public.user_management_audit_log(created_at);
CREATE INDEX idx_password_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX idx_properties_partner_id ON public.properties(partner_id);
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_offers_property_id ON public.offers(property_id);
CREATE INDEX idx_offers_common_investor_id ON public.offers(common_investor_id);
CREATE INDEX idx_offers_institutional_investor_id ON public.offers(institutional_investor_id);
CREATE INDEX idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX idx_user_activity_logs_created_at ON public.user_activity_logs(created_at);
CREATE INDEX idx_foreclosure_listings_county ON public.foreclosure_listings(county);
CREATE INDEX idx_foreclosure_listings_auction_date ON public.foreclosure_listings(auction_date);
CREATE INDEX idx_foreclosure_listings_status ON public.foreclosure_listings(status);
CREATE INDEX idx_foreclosure_listings_featured ON public.foreclosure_listings(featured);