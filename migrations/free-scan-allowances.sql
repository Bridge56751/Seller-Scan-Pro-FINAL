BEGIN;
ALTER TABLE public.customer_scan_limits
  ADD COLUMN IF NOT EXISTS free_photo_used boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS free_barcode_used boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS total_scans integer NOT NULL DEFAULT 0;
COMMIT;
