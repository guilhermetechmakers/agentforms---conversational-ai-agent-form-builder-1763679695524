-- =====================================================
-- Migration: Create Promo Codes Table
-- Created: 2025-11-21T02:04:47Z
-- Tables: promo_codes
-- Purpose: Store promo code definitions and usage tracking
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
-- TABLE: promo_codes
-- Purpose: Store promo code definitions
-- =====================================================
CREATE TABLE IF NOT EXISTS promo_codes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  
  -- Code identification
  code TEXT UNIQUE NOT NULL, -- The actual promo code (e.g., "SUMMER2024")
  description TEXT,
  
  -- Discount configuration
  discount_type TEXT DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed')) NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL, -- Percentage (0-100) or fixed amount in cents
  currency TEXT DEFAULT 'USD', -- Only used for fixed discounts
  
  -- Validity
  valid_from TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  valid_until TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  
  -- Usage limits
  max_uses INTEGER, -- NULL = unlimited
  max_uses_per_user INTEGER DEFAULT 1, -- How many times a single user can use it
  current_uses INTEGER DEFAULT 0 NOT NULL,
  
  -- Applicability
  applicable_plans TEXT[], -- Array of plan_ids this code applies to (empty = all plans)
  minimum_amount DECIMAL(10, 2), -- Minimum transaction amount required
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT promo_codes_code_not_empty CHECK (length(trim(code)) > 0),
  CONSTRAINT promo_codes_discount_value_positive CHECK (discount_value > 0),
  CONSTRAINT promo_codes_discount_percentage_range CHECK (
    (discount_type = 'percentage' AND discount_value BETWEEN 0 AND 100) OR
    (discount_type = 'fixed')
  ),
  CONSTRAINT promo_codes_max_uses_per_user_positive CHECK (max_uses_per_user > 0),
  CONSTRAINT promo_codes_current_uses_non_negative CHECK (current_uses >= 0),
  CONSTRAINT promo_codes_minimum_amount_positive CHECK (minimum_amount IS NULL OR minimum_amount > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS promo_codes_code_idx ON promo_codes(code);
CREATE INDEX IF NOT EXISTS promo_codes_is_active_idx ON promo_codes(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS promo_codes_valid_from_idx ON promo_codes(valid_from);
CREATE INDEX IF NOT EXISTS promo_codes_valid_until_idx ON promo_codes(valid_until) WHERE valid_until IS NOT NULL;
CREATE INDEX IF NOT EXISTS promo_codes_created_at_idx ON promo_codes(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_promo_codes_updated_at ON promo_codes;
CREATE TRIGGER update_promo_codes_updated_at
  BEFORE UPDATE ON promo_codes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Promo codes are publicly readable for validation
CREATE POLICY "promo_codes_select_all"
  ON promo_codes FOR SELECT
  USING (is_active = TRUE AND (valid_until IS NULL OR valid_until > NOW()));

-- Authenticated users can read all active promo codes
CREATE POLICY "promo_codes_select_authenticated"
  ON promo_codes FOR SELECT
  TO authenticated
  USING (TRUE);

-- Only admins can insert/update/delete (handled server-side)

-- Documentation
COMMENT ON TABLE promo_codes IS 'Promo code definitions and usage tracking';
COMMENT ON COLUMN promo_codes.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN promo_codes.code IS 'The promo code string (e.g., "SUMMER2024")';
COMMENT ON COLUMN promo_codes.discount_type IS 'Type of discount: percentage or fixed';
COMMENT ON COLUMN promo_codes.discount_value IS 'Discount value (percentage 0-100 or fixed amount)';
COMMENT ON COLUMN promo_codes.max_uses IS 'Maximum total uses (NULL = unlimited)';
COMMENT ON COLUMN promo_codes.current_uses IS 'Current number of times code has been used';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS promo_codes CASCADE;
