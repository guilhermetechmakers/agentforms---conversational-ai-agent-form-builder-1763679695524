-- =====================================================
-- Migration: Create Payment Methods Table
-- Created: 2025-11-21T03:16:53Z
-- Tables: payment_methods
-- Purpose: Store user payment methods (credit cards) securely
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
-- TABLE: payment_methods
-- Purpose: Store user payment methods securely
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Stripe integration
  stripe_payment_method_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  
  -- Card information (last 4 digits and metadata only - never store full card data)
  card_type TEXT, -- 'visa', 'mastercard', 'amex', 'discover', etc.
  card_last_four TEXT NOT NULL,
  card_brand TEXT, -- 'visa', 'mastercard', 'amex', etc.
  expiry_month INTEGER CHECK (expiry_month >= 1 AND expiry_month <= 12),
  expiry_year INTEGER CHECK (expiry_year >= 2020),
  
  -- Billing information
  billing_name TEXT,
  billing_email TEXT,
  billing_address JSONB, -- Full address as JSON
  
  -- Payment method status
  is_default BOOLEAN DEFAULT FALSE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT payment_methods_card_last_four_format CHECK (length(card_last_four) = 4 AND card_last_four ~ '^[0-9]+$'),
  CONSTRAINT payment_methods_expiry_valid CHECK (expiry_year IS NULL OR expiry_month IS NULL OR (expiry_year > 2020 OR (expiry_year = 2020 AND expiry_month >= 1)))
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS payment_methods_user_id_idx ON payment_methods(user_id);
CREATE INDEX IF NOT EXISTS payment_methods_stripe_payment_method_id_idx ON payment_methods(stripe_payment_method_id);
CREATE INDEX IF NOT EXISTS payment_methods_stripe_customer_id_idx ON payment_methods(stripe_customer_id);
CREATE INDEX IF NOT EXISTS payment_methods_is_default_idx ON payment_methods(is_default) WHERE is_default = TRUE;
CREATE INDEX IF NOT EXISTS payment_methods_is_active_idx ON payment_methods(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS payment_methods_created_at_idx ON payment_methods(created_at DESC);

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_payment_methods_updated_at ON payment_methods;
CREATE TRIGGER update_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to ensure only one default payment method per user
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    -- Unset all other default payment methods for this user
    UPDATE payment_methods
    SET is_default = FALSE
    WHERE user_id = NEW.user_id
      AND id != NEW.id
      AND is_default = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce single default payment method
DROP TRIGGER IF EXISTS trigger_ensure_single_default_payment_method ON payment_methods;
CREATE TRIGGER trigger_ensure_single_default_payment_method
  BEFORE INSERT OR UPDATE ON payment_methods
  FOR EACH ROW
  WHEN (NEW.is_default = TRUE)
  EXECUTE FUNCTION ensure_single_default_payment_method();

-- Enable Row Level Security
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own payment methods
CREATE POLICY "payment_methods_select_own"
  ON payment_methods FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "payment_methods_insert_own"
  ON payment_methods FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payment_methods_update_own"
  ON payment_methods FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "payment_methods_delete_own"
  ON payment_methods FOR DELETE
  USING (auth.uid() = user_id);

-- Documentation
COMMENT ON TABLE payment_methods IS 'User payment methods (credit cards) stored securely via Stripe';
COMMENT ON COLUMN payment_methods.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN payment_methods.user_id IS 'Owner of this payment method (references auth.users)';
COMMENT ON COLUMN payment_methods.stripe_payment_method_id IS 'Stripe payment method ID (never store full card data)';
COMMENT ON COLUMN payment_methods.card_last_four IS 'Last 4 digits of the card number';
COMMENT ON COLUMN payment_methods.is_default IS 'Whether this is the default payment method for the user';
COMMENT ON COLUMN payment_methods.is_active IS 'Whether this payment method is active';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS payment_methods CASCADE;
-- DROP FUNCTION IF EXISTS ensure_single_default_payment_method() CASCADE;
