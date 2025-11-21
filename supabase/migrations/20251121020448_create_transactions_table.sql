-- =====================================================
-- Migration: Create Transactions Table
-- Created: 2025-11-21T02:04:48Z
-- Tables: transactions
-- Purpose: Store payment transaction records
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
-- TABLE: transactions
-- Purpose: Store payment transaction records
-- =====================================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES plans(id) ON DELETE RESTRICT,
  
  -- Transaction details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'canceled')) NOT NULL,
  
  -- Stripe integration
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  stripe_customer_id TEXT,
  
  -- Billing cycle
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
  
  -- Promo code (if applied)
  promo_code_id UUID REFERENCES promo_codes(id) ON DELETE SET NULL,
  
  -- Discount applied
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2) NOT NULL, -- amount - discount_amount
  
  -- Transaction metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Error information (if failed)
  error_message TEXT,
  error_code TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT transactions_amount_positive CHECK (amount > 0),
  CONSTRAINT transactions_final_amount_positive CHECK (final_amount >= 0),
  CONSTRAINT transactions_discount_non_negative CHECK (discount_amount >= 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_plan_id_idx ON transactions(plan_id);
CREATE INDEX IF NOT EXISTS transactions_status_idx ON transactions(status);
CREATE INDEX IF NOT EXISTS transactions_stripe_payment_intent_id_idx ON transactions(stripe_payment_intent_id) WHERE stripe_payment_intent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS transactions_created_at_idx ON transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS transactions_promo_code_id_idx ON transactions(promo_code_id) WHERE promo_code_id IS NOT NULL;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own transactions
CREATE POLICY "transactions_select_own"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert_own"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only system can update transactions (via service role)
-- Users cannot update their own transactions directly

-- Documentation
COMMENT ON TABLE transactions IS 'Payment transaction records';
COMMENT ON COLUMN transactions.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN transactions.user_id IS 'User who made the transaction';
COMMENT ON COLUMN transactions.plan_id IS 'Plan that was purchased';
COMMENT ON COLUMN transactions.amount IS 'Original transaction amount';
COMMENT ON COLUMN transactions.final_amount IS 'Final amount after discounts';
COMMENT ON COLUMN transactions.status IS 'Transaction status: pending, processing, completed, failed, refunded, canceled';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS transactions CASCADE;
