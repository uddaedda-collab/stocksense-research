# Supabase Setup

The database schema lives at `apps/api/src/db/schema.sql` (single source of
truth — a duplicate copy that used to live in this folder was removed to
avoid drift between two versions).

## Setup steps

1. Create a free Supabase project at https://supabase.com.
2. Open the SQL Editor in your project dashboard.
3. Paste the contents of `../apps/api/src/db/schema.sql` and run it.
4. Go to Project Settings -> API and copy:
   - `Project URL` -> `SUPABASE_URL` in `apps/api/.env`
   - `service_role` secret key -> `SUPABASE_SERVICE_ROLE_KEY` in `apps/api/.env`

The backend always connects using the service-role key (which bypasses Row
Level Security) and enforces per-user data access itself using verified
Firebase ID tokens. The RLS policies in the schema exist as a defense-in-depth
safety net in case the anon/public key is ever used directly from a client.
