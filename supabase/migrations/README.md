# Supabase Migrations

This directory contains SQL migration files for the database schema.

## File Naming Convention
`YYYYMMDDHHmmss_description.sql`

Example: `20241013120000_create_users_table.sql`

## Creating a New Migration

1. Create a new SQL file with timestamp prefix
2. Write your SQL (CREATE TABLE, ALTER TABLE, etc.)
3. Include rollback instructions in comments
4. Create a corresponding .meta.json file
5. Update ../MIGRATIONS.md

## Migration Structure

Each migration should include:
- Extension requirements
- Helper functions (if needed)
- Table creation
- Indexes
- Triggers
- RLS policies
- Comments

See existing migrations for examples.

## Important Notes

- Migrations are NOT automatically executed
- All migrations are sent to the application for review and approval
- The application handles deployment to Supabase
- Never execute SQL directly from development environment
