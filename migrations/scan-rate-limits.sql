BEGIN;
CREATE TABLE IF NOT EXISTS public.customer_scan_limits (
  customer_id text PRIMARY KEY REFERENCES public.device_customers(customer_id) ON DELETE CASCADE,
  month_start timestamptz NOT NULL,
  monthly_count integer NOT NULL DEFAULT 0 CHECK (monthly_count >= 0),
  recent_scans timestamptz[] NOT NULL DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS public.scan_search_permits (
  id uuid PRIMARY KEY,
  customer_id text NOT NULL REFERENCES public.device_customers(customer_id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  used boolean NOT NULL DEFAULT false
);
CREATE INDEX IF NOT EXISTS scan_search_permits_expiry ON public.scan_search_permits(expires_at);
ALTER TABLE public.customer_scan_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scan_search_permits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.customer_scan_limits, public.scan_search_permits FROM anon, authenticated;
COMMIT;
