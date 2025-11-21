/**
 * Database type definitions
 * This file aggregates all database types for Supabase
 */

export * from './landing-page';
export * from './profile';
export * from './agent';
export * from './session';
export * from './webhook';
export * from './team-member';
export * from './subscription';
export * from './plan';
export * from './transaction';
export * from './invoice';
export * from './promo-code';
export * from './security-settings';
export * from './notification-preference';
export * from './faq';
export * from './support-request';
export * from './help-center-interaction';
export * from './error-log';
export * from './support-ticket';
export * from './sso-configuration';
export * from './agent-schema';
export * from './schema-field';
export * from './validation-rule';
export * from './general-validation-rule';
export * from './schema-draft';
export * from './knowledge-snippet';
export * from './audit-log';
export * from './payment-method';
export * from './retention-policy';
export * from './access-control';
export * from './dsr-request';

// Main Database type for Supabase client
export interface Database {
  public: {
    Tables: {
      landing_page_tracking: {
        Row: import('./landing-page').LandingPageTracking;
        Insert: import('./landing-page').LandingPageTrackingInsert;
        Update: import('./landing-page').LandingPageTrackingUpdate;
      };
      landing_page_content: {
        Row: import('./landing-page').LandingPageContent;
        Insert: import('./landing-page').LandingPageContentInsert;
        Update: import('./landing-page').LandingPageContentUpdate;
      };
      profiles: {
        Row: import('./profile').Profile;
        Insert: import('./profile').ProfileInsert;
        Update: import('./profile').ProfileUpdate;
      };
      agents: {
        Row: import('./agent').Agent;
        Insert: import('./agent').AgentInsert;
        Update: import('./agent').AgentUpdate;
      };
      sessions: {
        Row: import('./session').Session;
        Insert: import('./session').SessionInsert;
        Update: import('./session').SessionUpdate;
      };
      messages: {
        Row: import('./session').Message;
        Insert: import('./session').MessageInsert;
        Update: never;
      };
      extracted_fields: {
        Row: import('./session').ExtractedField;
        Insert: import('./session').ExtractedFieldInsert;
        Update: never;
      };
      webhooks: {
        Row: import('./webhook').Webhook;
        Insert: import('./webhook').WebhookInsert;
        Update: import('./webhook').WebhookUpdate;
      };
      webhook_deliveries: {
        Row: import('./webhook').WebhookDelivery;
        Insert: import('./webhook').WebhookDeliveryInsert;
        Update: never;
      };
      team_members: {
        Row: import('./team-member').TeamMember;
        Insert: import('./team-member').TeamMemberInsert;
        Update: import('./team-member').TeamMemberUpdate;
      };
      subscriptions: {
        Row: import('./subscription').Subscription;
        Insert: import('./subscription').SubscriptionInsert;
        Update: import('./subscription').SubscriptionUpdate;
      };
      plans: {
        Row: import('./plan').Plan;
        Insert: import('./plan').PlanInsert;
        Update: import('./plan').PlanUpdate;
      };
      transactions: {
        Row: import('./transaction').Transaction;
        Insert: import('./transaction').TransactionInsert;
        Update: import('./transaction').TransactionUpdate;
      };
      invoices: {
        Row: import('./invoice').Invoice;
        Insert: import('./invoice').InvoiceInsert;
        Update: import('./invoice').InvoiceUpdate;
      };
      promo_codes: {
        Row: import('./promo-code').PromoCode;
        Insert: import('./promo-code').PromoCodeInsert;
        Update: import('./promo-code').PromoCodeUpdate;
      };
      security_settings: {
        Row: import('./security-settings').SecuritySettings;
        Insert: import('./security-settings').SecuritySettingsInsert;
        Update: import('./security-settings').SecuritySettingsUpdate;
      };
      notification_preferences: {
        Row: import('./notification-preference').NotificationPreference;
        Insert: import('./notification-preference').NotificationPreferenceInsert;
        Update: import('./notification-preference').NotificationPreferenceUpdate;
      };
      faqs: {
        Row: import('./faq').FAQ;
        Insert: import('./faq').FAQInsert;
        Update: import('./faq').FAQUpdate;
      };
      support_requests: {
        Row: import('./support-request').SupportRequest;
        Insert: import('./support-request').SupportRequestInsert;
        Update: import('./support-request').SupportRequestUpdate;
      };
      help_center_interactions: {
        Row: import('./help-center-interaction').HelpCenterInteraction;
        Insert: import('./help-center-interaction').HelpCenterInteractionInsert;
        Update: never;
      };
      error_logs: {
        Row: import('./error-log').ErrorLog;
        Insert: import('./error-log').ErrorLogInsert;
        Update: import('./error-log').ErrorLogUpdate;
      };
      support_tickets: {
        Row: import('./support-ticket').SupportTicket;
        Insert: import('./support-ticket').SupportTicketInsert;
        Update: import('./support-ticket').SupportTicketUpdate;
      };
      sso_configurations: {
        Row: import('./sso-configuration').SSOConfiguration;
        Insert: import('./sso-configuration').SSOConfigurationInsert;
        Update: import('./sso-configuration').SSOConfigurationUpdate;
      };
      agent_schemas: {
        Row: import('./agent-schema').AgentSchema;
        Insert: import('./agent-schema').AgentSchemaInsert;
        Update: import('./agent-schema').AgentSchemaUpdate;
      };
      schema_fields: {
        Row: import('./schema-field').SchemaField;
        Insert: import('./schema-field').SchemaFieldInsert;
        Update: import('./schema-field').SchemaFieldUpdate;
      };
      validation_rules: {
        Row: import('./validation-rule').ValidationRule;
        Insert: import('./validation-rule').ValidationRuleInsert;
        Update: import('./validation-rule').ValidationRuleUpdate;
      };
      general_validation_rules: {
        Row: import('./general-validation-rule').GeneralValidationRule;
        Insert: import('./general-validation-rule').GeneralValidationRuleInsert;
        Update: import('./general-validation-rule').GeneralValidationRuleUpdate;
      };
      schema_drafts: {
        Row: import('./schema-draft').SchemaDraft;
        Insert: import('./schema-draft').SchemaDraftInsert;
        Update: import('./schema-draft').SchemaDraftUpdate;
      };
      knowledge_snippets: {
        Row: import('./knowledge-snippet').KnowledgeSnippet;
        Insert: import('./knowledge-snippet').KnowledgeSnippetInsert;
        Update: import('./knowledge-snippet').KnowledgeSnippetUpdate;
      };
      audit_logs: {
        Row: import('./audit-log').AuditLog;
        Insert: import('./audit-log').AuditLogInsert;
        Update: import('./audit-log').AuditLogUpdate;
      };
      payment_methods: {
        Row: import('./payment-method').PaymentMethod;
        Insert: import('./payment-method').PaymentMethodInsert;
        Update: import('./payment-method').PaymentMethodUpdate;
      };
      retention_policies: {
        Row: import('./retention-policy').RetentionPolicy;
        Insert: import('./retention-policy').RetentionPolicyInsert;
        Update: import('./retention-policy').RetentionPolicyUpdate;
      };
      access_controls: {
        Row: import('./access-control').AccessControl;
        Insert: import('./access-control').AccessControlInsert;
        Update: import('./access-control').AccessControlUpdate;
      };
      dsr_requests: {
        Row: import('./dsr-request').DSRRequest;
        Insert: import('./dsr-request').DSRRequestInsert;
        Update: import('./dsr-request').DSRRequestUpdate;
      };
    };
  };
}
