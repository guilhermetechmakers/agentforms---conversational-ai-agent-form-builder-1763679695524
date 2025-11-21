-- =====================================================
-- Migration: Extend Audit Logs for Security & Privacy Events
-- Created: 2025-11-21T03:27:37Z
-- Tables: audit_logs (modify)
-- Purpose: Add security and privacy-related action types to audit logs
-- =====================================================

-- Extend action_type enum to include security/privacy events
-- Note: PostgreSQL doesn't support ALTER TYPE ADD VALUE in a transaction block
-- So we'll use a workaround by dropping and recreating the constraint

-- First, drop the existing check constraint
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_action_type_check;

-- Add new check constraint with extended action types
ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_action_type_check
  CHECK (action_type IN (
    -- Existing actions
    'team_member_invited',
    'team_member_role_changed',
    'team_member_removed',
    'team_member_accepted',
    'team_member_declined',
    'seat_added',
    'seat_removed',
    'subscription_changed',
    'billing_updated',
    'permission_changed',
    'settings_updated',
    -- Security & Privacy actions
    'data_encrypted',
    'data_decrypted',
    'retention_policy_created',
    'retention_policy_updated',
    'retention_policy_deleted',
    'data_deleted_by_retention',
    'access_control_created',
    'access_control_updated',
    'access_control_revoked',
    'dsr_request_submitted',
    'dsr_request_processed',
    'dsr_export_generated',
    'dsr_deletion_completed',
    'data_exported',
    'session_accessed',
    'sensitive_data_accessed',
    'encryption_key_rotated',
    'audit_log_exported',
    'compliance_report_generated'
  ));

-- Extend entity_type enum
ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_entity_type_check;

ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_entity_type_check
  CHECK (entity_type IN (
    -- Existing entities
    'team_member',
    'subscription',
    'billing',
    'settings',
    'permission',
    -- Security & Privacy entities
    'retention_policy',
    'access_control',
    'dsr_request',
    'session',
    'export',
    'encryption_key',
    'audit_log'
  ));

-- Add index for security-related actions
CREATE INDEX IF NOT EXISTS audit_logs_security_actions_idx ON audit_logs(action_type, created_at DESC)
  WHERE action_type IN (
    'data_encrypted',
    'data_decrypted',
    'retention_policy_created',
    'retention_policy_updated',
    'retention_policy_deleted',
    'data_deleted_by_retention',
    'access_control_created',
    'access_control_updated',
    'access_control_revoked',
    'dsr_request_submitted',
    'dsr_request_processed',
    'dsr_export_generated',
    'dsr_deletion_completed',
    'data_exported',
    'session_accessed',
    'sensitive_data_accessed',
    'encryption_key_rotated',
    'audit_log_exported',
    'compliance_report_generated'
  );

-- Documentation
COMMENT ON COLUMN audit_logs.action_type IS 'Type of action performed (extended with security/privacy events)';
COMMENT ON COLUMN audit_logs.entity_type IS 'Type of entity affected (extended with security/privacy entities)';

-- =====================================================
-- ROLLBACK INSTRUCTIONS (for documentation only)
-- =====================================================
-- To rollback this migration, execute:
-- ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_action_type_check;
-- ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_action_type_check
--   CHECK (action_type IN (
--     'team_member_invited',
--     'team_member_role_changed',
--     'team_member_removed',
--     'team_member_accepted',
--     'team_member_declined',
--     'seat_added',
--     'seat_removed',
--     'subscription_changed',
--     'billing_updated',
--     'permission_changed',
--     'settings_updated'
--   ));
-- ALTER TABLE audit_logs DROP CONSTRAINT IF EXISTS audit_logs_entity_type_check;
-- ALTER TABLE audit_logs ADD CONSTRAINT audit_logs_entity_type_check
--   CHECK (entity_type IN (
--     'team_member',
--     'subscription',
--     'billing',
--     'settings',
--     'permission'
--   ));
-- DROP INDEX IF EXISTS audit_logs_security_actions_idx;
