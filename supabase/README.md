# Supabase Migrations

Run these SQL files **in order** via the Supabase SQL Editor or `supabase db push`:

| File | Description |
|------|-------------|
| `001_create_schema.sql` | Creates all 5 tables with indexes |
| `002_rls_policies.sql` | Enables RLS and defines per-user policies |
| `003_functions_triggers.sql` | `reserve_seat`, `cancel_booking`, `reschedule_booking` RPCs + cancellation trigger |
| `004_seed_data.sql` | 8 flights across 4 routes + full seat maps |

## Quick Run (Supabase CLI)

```bash
supabase login
supabase link --project-ref your-project-ref
supabase db push
```

## Manual (Dashboard)

1. Open your project → SQL Editor
2. Copy/paste each file contents and click **Run** in order
