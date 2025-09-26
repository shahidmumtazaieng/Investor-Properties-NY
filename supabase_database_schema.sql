-- =====================================================
-- INVESTOR PROPERTIES NY - COMPLETE DATABASE SCHEMA
-- =====================================================
-- This script creates all necessary tables for the Investor Properties NY application
-- Compatible with Supabase PostgreSQL

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CORE USER TABLES
-- =====================================================

-- Basic users table (legacy compatibility)
CREATE TABLE IF NOT EXISTS public.users (
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
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Common Investors (regular retail investors)
CREATE TABLE IF NOT EXISTS public.common_investors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  email text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  -- Email verification
  email_verified boolean NOT NULL DEFAULT false,
  email_verification_token text,
  email_verification_sent_at timestamp with time zone,
  email_verified_at timestamp with time zone,
  -- Phone verification
  phone_verified boolean NOT NULL DEFAULT false,
  phone_verification_code text,
  phone_verification_sent_at timestamp with time zone,
  phone_verified_at timestamp with time zone,
  -- Subscription management
  has_foreclosure_subscription boolean NOT NULL DEFAULT false,
  foreclosure_subscription_expiry timestamp with time zone,
  subscription_plan text, -- monthly, yearly
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT common_investors_pkey PRIMARY KEY (id)
);

-- Common Investor Sessions
CREATE TABLE IF NOT EXISTS public.common_investor_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL,
  session_token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT common_investor_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT common_investor_sessions_investor_id_fkey FOREIGN KEY (investor_id) REFERENCES public.common_investors(id) ON DELETE CASCADE
);

-- Institutional Investors (large firms, funds, etc.)
CREATE TABLE IF NOT EXISTS public.institutional_investors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  person_name text NOT NULL,
  institution_name text NOT NULL,
  job_title text NOT NULL,
  email text NOT NULL UNIQUE,
  work_phone text NOT NULL,
  personal_phone text NOT NULL,
  business_card_url text,
  status text NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  username text UNIQUE,
  password text,
  is_active boolean DEFAULT false,
  approved_at timestamp with time zone,
  approved_by text,
  last_login_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT institutional_investors_pkey PRIMARY KEY (id)
);

-- Institutional Investor Sessions
CREATE TABLE IF NOT EXISTS public.institutional_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL,
  session_token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT institutional_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT institutional_sessions_investor_id_fkey FOREIGN KEY (investor_id) REFERENCES public.institutional_investors(id) ON DELETE CASCADE
);

-- Property Selling Partners (agents, wholesalers, etc.)
CREATE TABLE IF NOT EXISTS public.partners (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  password text NOT NULL,
  email text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  company text,
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  -- Approval workflow
  approval_status text NOT NULL DEFAULT 'pending', -- pending, approved, rejected
  approved_at timestamp with time zone,
  approved_by text,
  rejection_reason text,
  -- Email verification
  email_verified boolean NOT NULL DEFAULT false,
  email_verification_token text,
  email_verification_sent_at timestamp with time zone,
  email_verified_at timestamp with time zone,
  -- Phone verification
  phone_verified boolean NOT NULL DEFAULT false,
  phone_verification_code text,
  phone_verification_sent_at timestamp with time zone,
  phone_verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT partners_pkey PRIMARY KEY (id)
);

-- =====================================================
-- PROPERTY MANAGEMENT
-- =====================================================

-- Properties table (main property listings)
CREATE TABLE IF NOT EXISTS public.properties (
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
  arv numeric, -- After Repair Value
  estimated_profit numeric,
  cap_rate numeric,
  annual_income numeric,
  condition text,
  access text NOT NULL DEFAULT 'Available with Appointment',
  images text[], -- Array of image URLs
  description text,
  google_sheets_row_id text, -- For Google Sheets integration
  partner_id uuid,
  source text NOT NULL DEFAULT 'internal', -- internal, partner, google_sheets
  status text NOT NULL DEFAULT 'available', -- available, under_contract, sold
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT properties_pkey PRIMARY KEY (id),
  CONSTRAINT properties_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id)
);

-- =====================================================
-- LEAD MANAGEMENT SYSTEM
-- =====================================================

-- Universal Leads table (buyers and sellers)
CREATE TABLE IF NOT EXISTS public.leads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type text NOT NULL, -- buyer, seller
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  source text NOT NULL, -- website_form, manual_entry, referral
  status text NOT NULL DEFAULT 'new', -- new, contacted, qualified, converted, closed
  motivation text,
  timeline text,
  budget text,
  preferred_areas text[],
  experience_level text,
  property_details jsonb, -- For seller leads
  notes text,
  -- Email verification
  email_verified boolean NOT NULL DEFAULT false,
  email_verification_token text,
  email_verification_sent_at timestamp with time zone,
  email_verified_at timestamp with time zone,
  -- Phone verification
  phone_verified boolean NOT NULL DEFAULT false,
  phone_verification_code text,
  phone_verification_sent_at timestamp with time zone,
  phone_verified_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT leads_pkey PRIMARY KEY (id)
);

-- Buyer Leads (specific buyer information) - LEGACY COMPATIBILITY
CREATE TABLE IF NOT EXISTS public.buyer_leads (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text NOT NULL,
  motivation text DEFAULT 'investment',
  timeline text DEFAULT '3-6 months',
  budget text DEFAULT '$100k-$500k',
  preferred_areas text[] DEFAULT '{}',
  experience_level text DEFAULT 'beginner',
  email_verified boolean NOT NULL DEFAULT false,
  phone_verified boolean NOT NULL DEFAULT false,
  email_verification_token text,
  email_verification_sent_at timestamp with time zone,
  email_verified_at timestamp with time zone,
  phone_verification_code text,
  phone_verification_sent_at timestamp with time zone,
  phone_verified_at timestamp with time zone,
  status text DEFAULT 'active',
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT buyer_leads_pkey PRIMARY KEY (id)
);

-- =====================================================
-- OFFERS MANAGEMENT
-- =====================================================

-- Offers table (supports all investor types)
CREATE TABLE IF NOT EXISTS public.offers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL,
  -- Support multiple investor types
  common_investor_id uuid,
  institutional_investor_id uuid,
  buyer_lead_id uuid, -- Legacy compatibility
  offer_amount numeric NOT NULL,
  terms text,
  status text NOT NULL DEFAULT 'pending', -- pending, accepted, rejected, countered
  offer_letter_url text, -- Document upload
  proof_of_funds_url text, -- Document upload
  closing_date text,
  down_payment numeric,
  financing_type text, -- cash, conventional, fha, etc.
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

-- =====================================================
-- FORECLOSURE SYSTEM
-- =====================================================

-- Foreclosure Listings
CREATE TABLE IF NOT EXISTS public.foreclosure_listings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  address text NOT NULL,
  county text NOT NULL, -- Queens, Brooklyn, Nassau, Suffolk
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
  status text NOT NULL DEFAULT 'upcoming', -- upcoming, completed, cancelled
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT foreclosure_listings_pkey PRIMARY KEY (id)
);

-- Foreclosure Subscriptions
CREATE TABLE IF NOT EXISTS public.foreclosure_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  counties text[] NOT NULL, -- Selected counties
  subscription_type text NOT NULL, -- weekly, instant
  is_active boolean NOT NULL DEFAULT true,
  last_sent timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT foreclosure_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT foreclosure_subscriptions_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id)
);

-- Bid Service Requests (foreclosure assistance)
CREATE TABLE IF NOT EXISTS public.bid_service_requests (
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
  status text DEFAULT 'pending',
  assigned_to text,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT bid_service_requests_pkey PRIMARY KEY (id),
  CONSTRAINT bid_service_requests_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id),
  CONSTRAINT bid_service_requests_foreclosure_listing_id_fkey FOREIGN KEY (foreclosure_listing_id) REFERENCES public.foreclosure_listings(id)
);

-- Weekly Subscribers (manual follow-up)
CREATE TABLE IF NOT EXISTS public.weekly_subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  counties text[] NOT NULL,
  plan_type text NOT NULL, -- weekly, monthly
  status text DEFAULT 'pending', -- pending, contacted, subscribed
  created_at timestamp with time zone DEFAULT now(),
  notes text,
  CONSTRAINT weekly_subscribers_pkey PRIMARY KEY (id)
);

-- =====================================================
-- INSTITUTIONAL INVESTOR FEATURES
-- =====================================================

-- Institutional Foreclosure Lists (weekly delivery)
CREATE TABLE IF NOT EXISTS public.institutional_foreclosure_lists (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  week_of_date timestamp with time zone NOT NULL,
  properties jsonb NOT NULL, -- Array of property objects
  total_properties integer NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT institutional_foreclosure_lists_pkey PRIMARY KEY (id)
);

-- Institutional Bid Tracking
CREATE TABLE IF NOT EXISTS public.institutional_bid_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL,
  property_id uuid, -- Can be null for foreclosure properties
  property_address text NOT NULL,
  bid_amount text NOT NULL,
  auction_date timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'submitted', -- submitted, won, lost, pending
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT institutional_bid_tracking_pkey PRIMARY KEY (id),
  CONSTRAINT institutional_bid_tracking_investor_id_fkey FOREIGN KEY (investor_id) REFERENCES public.institutional_investors(id)
);

-- Institutional Weekly Deliveries
CREATE TABLE IF NOT EXISTS public.institutional_weekly_deliveries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL,
  foreclosure_list_id uuid NOT NULL,
  delivered_at timestamp with time zone DEFAULT now(),
  email_sent boolean DEFAULT false,
  CONSTRAINT institutional_weekly_deliveries_pkey PRIMARY KEY (id),
  CONSTRAINT institutional_weekly_deliveries_investor_id_fkey FOREIGN KEY (investor_id) REFERENCES public.institutional_investors(id),
  CONSTRAINT institutional_weekly_deliveries_foreclosure_list_id_fkey FOREIGN KEY (foreclosure_list_id) REFERENCES public.institutional_foreclosure_lists(id)
);

-- =====================================================
-- COMMUNICATION & MARKETING
-- =====================================================

-- Communications Log
CREATE TABLE IF NOT EXISTS public.communications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL,
  type text NOT NULL, -- email, sms, call, meeting
  direction text NOT NULL, -- inbound, outbound
  subject text,
  content text,
  status text NOT NULL DEFAULT 'sent', -- sent, delivered, read, failed
  scheduled_for timestamp with time zone,
  sent_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT communications_pkey PRIMARY KEY (id),
  CONSTRAINT communications_lead_id_fkey FOREIGN KEY (lead_id) REFERENCES public.leads(id)
);

-- Blog Posts (for content marketing)
CREATE TABLE IF NOT EXISTS public.blogs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  excerpt text,
  cover_image text,
  author text NOT NULL,
  tags text[],
  published boolean NOT NULL DEFAULT false,
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT blogs_pkey PRIMARY KEY (id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- User authentication indexes
CREATE INDEX IF NOT EXISTS idx_common_investors_email ON public.common_investors(email);
CREATE INDEX IF NOT EXISTS idx_common_investors_username ON public.common_investors(username);
CREATE INDEX IF NOT EXISTS idx_institutional_investors_email ON public.institutional_investors(email);
CREATE INDEX IF NOT EXISTS idx_partners_email ON public.partners(email);

-- Session management indexes
CREATE INDEX IF NOT EXISTS idx_common_investor_sessions_token ON public.common_investor_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_institutional_sessions_token ON public.institutional_sessions(session_token);

-- Property search indexes
CREATE INDEX IF NOT EXISTS idx_properties_borough ON public.properties(borough);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_is_active ON public.properties(is_active);

-- Lead management indexes
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_type ON public.leads(type);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_source ON public.leads(source);

-- Foreclosure indexes
CREATE INDEX IF NOT EXISTS idx_foreclosure_listings_county ON public.foreclosure_listings(county);
CREATE INDEX IF NOT EXISTS idx_foreclosure_listings_auction_date ON public.foreclosure_listings(auction_date);
CREATE INDEX IF NOT EXISTS idx_foreclosure_listings_status ON public.foreclosure_listings(status);

-- Offer management indexes
CREATE INDEX IF NOT EXISTS idx_offers_property_id ON public.offers(property_id);
CREATE INDEX IF NOT EXISTS idx_offers_common_investor_id ON public.offers(common_investor_id);
CREATE INDEX IF NOT EXISTS idx_offers_institutional_investor_id ON public.offers(institutional_investor_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON public.offers(status);

-- =====================================================
-- RLS (Row Level Security) POLICIES
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE public.common_investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_investors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Common Investors can only access their own data
CREATE POLICY "Common investors can view own data" ON public.common_investors
  FOR ALL USING (auth.uid()::text = id::text);

-- Institutional Investors can only access their own data
CREATE POLICY "Institutional investors can view own data" ON public.institutional_investors
  FOR ALL USING (auth.uid()::text = id::text);

-- Partners can only access their own data
CREATE POLICY "Partners can view own data" ON public.partners
  FOR ALL USING (auth.uid()::text = id::text);

-- Properties are publicly readable but only partners can modify their own
CREATE POLICY "Properties are publicly readable" ON public.properties
  FOR SELECT USING (true);

CREATE POLICY "Partners can modify own properties" ON public.properties
  FOR ALL USING (auth.uid()::text = partner_id::text);

-- =====================================================
-- TRIGGER FUNCTIONS FOR AUTOMATIC UPDATES
-- =====================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers to relevant tables
CREATE TRIGGER update_common_investors_updated_at BEFORE UPDATE ON public.common_investors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_institutional_investors_updated_at BEFORE UPDATE ON public.institutional_investors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON public.partners FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON public.offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_foreclosure_listings_updated_at BEFORE UPDATE ON public.foreclosure_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_foreclosure_subscriptions_updated_at BEFORE UPDATE ON public.foreclosure_subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bid_service_requests_updated_at BEFORE UPDATE ON public.bid_service_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_institutional_bid_tracking_updated_at BEFORE UPDATE ON public.institutional_bid_tracking FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SAMPLE DATA (OPTIONAL - REMOVE IN PRODUCTION)
-- =====================================================

-- Insert sample properties for testing
INSERT INTO public.properties (address, neighborhood, borough, property_type, beds, baths, sqft, price, description, status, is_active) VALUES
('123 Main St', 'Astoria', 'Queens', 'Single Family', 3, 2, 1500, 450000, 'Beautiful single family home in Astoria', 'available', true),
('456 Oak Ave', 'Park Slope', 'Brooklyn', 'Multi-Family', 6, 4, 3000, 890000, 'Investment property in prime Park Slope location', 'available', true),
('789 Pine St', 'Upper East Side', 'Manhattan', 'Condo', 2, 2, 1200, 1200000, 'Luxury condo with city views', 'available', true)
ON CONFLICT DO NOTHING;

-- Insert sample foreclosure listings
INSERT INTO public.foreclosure_listings (address, county, auction_date, starting_bid, assessed_value, property_type, description, status) VALUES
('321 Elm St', 'Queens', '2024-02-15 10:00:00+00', 300000, 450000, 'Single Family', 'Foreclosure auction in Queens', 'upcoming'),
('654 Maple Ave', 'Brooklyn', '2024-02-20 11:00:00+00', 450000, 600000, 'Multi-Family', 'Investment opportunity in Brooklyn', 'upcoming')
ON CONFLICT DO NOTHING;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

-- Create a view to verify table creation
CREATE OR REPLACE VIEW public.table_summary AS
SELECT 
  schemaname,
  tablename,
  rowcount
FROM (
  SELECT 
    schemaname, 
    tablename,
    (SELECT count(*) FROM (SELECT 1 FROM information_schema.tables WHERE table_schema = schemaname AND table_name = tablename) x) as rowcount
  FROM pg_tables 
  WHERE schemaname = 'public'
) t
ORDER BY tablename;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database schema creation completed successfully!';
  RAISE NOTICE 'Tables created for Investor Properties NY application';
  RAISE NOTICE 'Run: SELECT * FROM public.table_summary; to verify all tables';
END $$;