/**
 * Database types for dsr_requests table
 * Generated: 2025-11-21T03:27:36Z
 */

export type DSRRequestType = 
  | 'export'      // Right to access (GDPR Article 15)
  | 'deletion'    // Right to erasure (GDPR Article 17)
  | 'portability' // Right to data portability (GDPR Article 20)
  | 'rectification'; // Right to rectification (GDPR Article 16)

export type DSRRequestStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export type DSRVerificationMethod = 
  | 'email'
  | 'id_verification'
  | 'manual';

export interface DSRRequest {
  id: string;
  user_id: string;
  request_type: DSRRequestType;
  status: DSRRequestStatus;
  description: string | null;
  requested_data_types: string[];
  processed_by: string | null;
  processed_at: string | null;
  processing_notes: string | null;
  export_file_url: string | null;
  export_file_expires_at: string | null;
  deleted_records_count: number;
  deleted_data_types: string[];
  verification_token: string | null;
  verification_method: DSRVerificationMethod | null;
  verified_at: string | null;
  submitted_at: string;
  due_date: string | null;
  completed_at: string | null;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface DSRRequestInsert {
  id?: string;
  user_id: string;
  request_type: DSRRequestType;
  status?: DSRRequestStatus;
  description?: string | null;
  requested_data_types?: string[];
  processed_by?: string | null;
  processed_at?: string | null;
  processing_notes?: string | null;
  export_file_url?: string | null;
  export_file_expires_at?: string | null;
  deleted_records_count?: number;
  deleted_data_types?: string[];
  verification_token?: string | null;
  verification_method?: DSRVerificationMethod | null;
  verified_at?: string | null;
  submitted_at?: string;
  due_date?: string | null;
  completed_at?: string | null;
  metadata?: Record<string, any>;
}

export interface DSRRequestUpdate {
  status?: DSRRequestStatus;
  description?: string | null;
  requested_data_types?: string[];
  processed_by?: string | null;
  processed_at?: string | null;
  processing_notes?: string | null;
  export_file_url?: string | null;
  export_file_expires_at?: string | null;
  deleted_records_count?: number;
  deleted_data_types?: string[];
  verification_token?: string | null;
  verification_method?: DSRVerificationMethod | null;
  verified_at?: string | null;
  due_date?: string | null;
  completed_at?: string | null;
  metadata?: Record<string, any>;
}

// Supabase query result type
export type DSRRequestRow = DSRRequest;
