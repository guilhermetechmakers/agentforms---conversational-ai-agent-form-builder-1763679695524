-- =====================================================
-- Migration: Create Plans Table
-- Created: 2025-11-21T02:04:46Z
-- Tables: plans
-- Purpose: Store subscription plan definitions and pricing
-- =====================================================

-- Enable UUID extension (idempotent)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function for updated_at (idempotent)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TABLE: plans
-- Purpose: Store subscription plan definitions
-- =====================================================
CREATE TABLE IF NOT EXISTS plans (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Plan identification
  plan_id TEXT UNIQUE NOT NULL, -- 'free', 'pro', 'enterprise'
  name TEXT NOT NULL,
  description TEXT,
  
  -- Pricing
  price_monthly DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_yearly DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'USD' NOT NULL,
  
  -- Features (stored as JSONB for flexibility)
  features JSONB DEFAULT '[]'::jsonb, -- Array of feature strings
  limits JSONB DEFAULT '{}'::jsonb, -- Usage limits: { agents: 10, sessions: 1000, etc. }
  
  -- Stripe integration
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  
  -- Plan status
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE NOT NULL,
  display_order INTEGER DEFAULT 0 NOT NULL,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT plans_plan_id_not_empty CHECK (length(trim(plan_id)) > 0),
  CONSTRAINT plans_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT plans_price_monthly_non_negative CHECK (price_monthly >= 0),
  CONSTRAINT plans_price_yearly_non_negative CHECK (price_yearly >= 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS plans_plan_id_idx ON plans(plan_id);
CREATE INDEX IF NOT EXISTS plans_is_active_idx ON plans(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS plans_display_order_idx ON plans(display_order);
CREATE INDEX IF NOT EXISTS plans_created_at_idx ON plans(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_plans_updated_at ON plans;
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON plans
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Plans are publicly readable (for pricing page)
CREATE POLICY "plans_select_all"
  ON plans FOR SELECT
  USING (is_active = TRUE);

-- Only admins can insert/update/delete plans (this would be handled server-side)
-- For now, we'll allow authenticated users to read all plans
CREATE POLICY "plans_select_authenticated"
  ON plans FOR SELECT
  TO authenticated
  USING (TRUE);

-- Documentation
COMMENT ON TABLE plans IS 'Subscription plan definitions and pricing';
COMMENT ON COLUMN plans.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN plans.plan_id IS 'Unique plan identifier (free, pro, enterprise)';
COMMENT ON COLUMN plans.price_monthly IS 'Monthly price in cents';
COMMENT ON COLUMN plans.price_yearly IS 'Yearly price in cents';
COMMENT ON COLUMN plans.features IS 'JSON array of feature descriptions';
COMMENT ON COLUMN plans.limits IS 'JSON object with usage limits';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS plans CASCADE;
