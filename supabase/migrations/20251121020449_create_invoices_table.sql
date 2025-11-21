-- =====================================================
-- Migration: Create Invoices Table
-- Created: 2025-11-21T02:04:49Z
-- Tables: invoices
-- Purpose: Store invoice records linked to transactions
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
-- TABLE: invoices
-- Purpose: Store invoice records
-- =====================================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  transaction_id UUID REFERENCES transactions(id) ON DELETE RESTRICT UNIQUE NOT NULL,
  
  -- Invoice details
  invoice_number TEXT UNIQUE NOT NULL, -- Human-readable invoice number
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD' NOT NULL,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL,
  
  -- Billing information
  billing_name TEXT,
  billing_email TEXT,
  billing_address JSONB, -- Full address as JSON
  
  -- Invoice status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'void')) NOT NULL,
  
  -- Dates
  invoice_date DATE DEFAULT CURRENT_DATE NOT NULL,
  due_date DATE,
  paid_date DATE,
  
  -- Stripe integration
  stripe_invoice_id TEXT UNIQUE,
  stripe_invoice_pdf_url TEXT,
  stripe_invoice_hosted_url TEXT,
  
  -- Invoice items (line items)
  items JSONB DEFAULT '[]'::jsonb, -- Array of line items
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT invoices_amount_positive CHECK (amount > 0),
  CONSTRAINT invoices_subtotal_positive CHECK (subtotal > 0),
  CONSTRAINT invoices_tax_non_negative CHECK (tax_amount >= 0),
  CONSTRAINT invoices_invoice_number_not_empty CHECK (length(trim(invoice_number)) > 0)
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS invoices_user_id_idx ON invoices(user_id);
CREATE INDEX IF NOT EXISTS invoices_transaction_id_idx ON invoices(transaction_id);
CREATE INDEX IF NOT EXISTS invoices_invoice_number_idx ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS invoices_status_idx ON invoices(status);
CREATE INDEX IF NOT EXISTS invoices_invoice_date_idx ON invoices(invoice_date DESC);
CREATE INDEX IF NOT EXISTS invoices_stripe_invoice_id_idx ON invoices(stripe_invoice_id) WHERE stripe_invoice_id IS NOT NULL;

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own invoices
CREATE POLICY "invoices_select_own"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "invoices_insert_own"
  ON invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only system can update invoices (via service role)
-- Users cannot update their own invoices directly

-- Documentation
COMMENT ON TABLE invoices IS 'Invoice records linked to transactions';
COMMENT ON COLUMN invoices.id IS 'Primary key (UUID v4)';
COMMENT ON COLUMN invoices.user_id IS 'User who owns this invoice';
COMMENT ON COLUMN invoices.transaction_id IS 'Associated transaction (one-to-one relationship)';
COMMENT ON COLUMN invoices.invoice_number IS 'Human-readable invoice number';
COMMENT ON COLUMN invoices.status IS 'Invoice status: draft, sent, paid, overdue, void';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- DROP TABLE IF EXISTS invoices CASCADE;
