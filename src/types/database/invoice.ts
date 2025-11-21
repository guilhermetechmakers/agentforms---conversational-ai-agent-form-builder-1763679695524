/**
 * Database types for invoices table
 * Generated: 2025-11-21T02:04:49Z
 */

export interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Invoice {
  id: string;
  user_id: string;
  transaction_id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  tax_amount: number;
  subtotal: number;
  billing_name: string | null;
  billing_email: string | null;
  billing_address: Record<string, any> | null;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  invoice_date: string;
  due_date: string | null;
  paid_date: string | null;
  stripe_invoice_id: string | null;
  stripe_invoice_pdf_url: string | null;
  stripe_invoice_hosted_url: string | null;
  items: InvoiceItem[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceInsert {
  id?: string;
  user_id: string;
  transaction_id: string;
  invoice_number: string;
  amount: number;
  currency?: string;
  tax_amount?: number;
  subtotal: number;
  billing_name?: string | null;
  billing_email?: string | null;
  billing_address?: Record<string, any> | null;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  invoice_date?: string;
  due_date?: string | null;
  paid_date?: string | null;
  stripe_invoice_id?: string | null;
  stripe_invoice_pdf_url?: string | null;
  stripe_invoice_hosted_url?: string | null;
  items?: InvoiceItem[];
  notes?: string | null;
}

export interface InvoiceUpdate {
  invoice_number?: string;
  amount?: number;
  currency?: string;
  tax_amount?: number;
  subtotal?: number;
  billing_name?: string | null;
  billing_email?: string | null;
  billing_address?: Record<string, any> | null;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  invoice_date?: string;
  due_date?: string | null;
  paid_date?: string | null;
  stripe_invoice_id?: string | null;
  stripe_invoice_pdf_url?: string | null;
  stripe_invoice_hosted_url?: string | null;
  items?: InvoiceItem[];
  notes?: string | null;
}

// Supabase query result type
export type InvoiceRow = Invoice;
