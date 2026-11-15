BEGIN;
ALTER TABLE public.scan_search_permits ADD COLUMN IF NOT EXISTS test_only boolean NOT NULL DEFAULT false;
COMMIT;
