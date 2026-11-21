BEGIN;
ALTER TABLE customer_scan_limits ADD COLUMN IF NOT EXISTS free_successful_scans integer NOT NULL DEFAULT 0;
CREATE TABLE IF NOT EXISTS free_scan_reservations (
  id uuid PRIMARY KEY,
  customer_id text NOT NULL REFERENCES device_customers(customer_id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS free_scan_reservations_customer ON free_scan_reservations(customer_id);
ALTER TABLE free_scan_reservations ENABLE ROW LEVEL SECURITY;
COMMIT;
