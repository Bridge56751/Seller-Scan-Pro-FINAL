BEGIN;
CREATE TABLE IF NOT EXISTS public.device_customers (
  device_hash text PRIMARY KEY,
  credential_hash text NOT NULL,
  customer_id text NOT NULL UNIQUE,
  test_customer_id text NOT NULL UNIQUE,
  scan_count integer NOT NULL DEFAULT 0 CHECK (scan_count >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.legacy_device_allowances (
  device_hash text PRIMARY KEY,
  scan_count integer NOT NULL CHECK (scan_count >= 0)
);
ALTER TABLE public.device_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legacy_device_allowances ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.device_customers, public.legacy_device_allowances FROM anon, authenticated;
COMMIT;
