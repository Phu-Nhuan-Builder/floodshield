-- FloodShield VN — Initial Database Schema
-- Run: supabase db push

-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── flood_zones ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flood_zones (
  id                TEXT PRIMARY KEY,
  province          TEXT NOT NULL,
  district          TEXT NOT NULL,
  severity          TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  flood_index       FLOAT NOT NULL CHECK (flood_index >= 0 AND flood_index <= 1),
  flooded_area_km2  FLOAT NOT NULL DEFAULT 0,
  detected_at       TIMESTAMPTZ NOT NULL,
  sentinel_item_id  TEXT NOT NULL,
  geometry          JSONB NOT NULL,
  confidence        INTEGER DEFAULT 70 CHECK (confidence >= 0 AND confidence <= 100),
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flood_zones_severity ON flood_zones (severity);
CREATE INDEX IF NOT EXISTS idx_flood_zones_detected_at ON flood_zones (detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_flood_zones_province ON flood_zones (province);

-- ── flood_alerts ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flood_alerts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id             TEXT REFERENCES flood_zones(id) ON DELETE CASCADE,
  province            TEXT NOT NULL,
  district            TEXT NOT NULL,
  severity            TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message             TEXT NOT NULL,
  message_vi          TEXT NOT NULL,
  expires_at          TIMESTAMPTZ NOT NULL,
  notifications_sent  INTEGER DEFAULT 0,
  acknowledged_at     TIMESTAMPTZ,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alerts_zone ON flood_alerts (zone_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created ON flood_alerts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_acknowledged ON flood_alerts (acknowledged_at) WHERE acknowledged_at IS NULL;

-- ── aid_payouts ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS aid_payouts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id             TEXT REFERENCES flood_zones(id),
  province            TEXT NOT NULL,
  recipient_address   TEXT NOT NULL,
  recipient_name      TEXT NOT NULL DEFAULT 'Community Member',
  amount              BIGINT NOT NULL,  -- lamports
  aid_type            TEXT NOT NULL CHECK (aid_type IN ('rice_voucher', 'fertilizer_voucher', 'cash')),
  tx_signature        TEXT,
  status              TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'processing', 'confirmed', 'failed')),
  triggered_at        TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at        TIMESTAMPTZ,
  block_height        BIGINT
);

CREATE INDEX IF NOT EXISTS idx_payouts_zone ON aid_payouts (zone_id);
CREATE INDEX IF NOT EXISTS idx_payouts_status ON aid_payouts (status);
CREATE INDEX IF NOT EXISTS idx_payouts_triggered ON aid_payouts (triggered_at DESC);

-- ── community_verifications ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS community_verifications (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id             TEXT REFERENCES flood_zones(id),
  submitter_address   TEXT NOT NULL DEFAULT 'anonymous',
  submitter_name      TEXT NOT NULL DEFAULT 'Community Member',
  image_url           TEXT NOT NULL,
  gps_lat             FLOAT NOT NULL,
  gps_lon             FLOAT NOT NULL,
  observed_severity   TEXT NOT NULL CHECK (observed_severity IN ('low', 'medium', 'high', 'critical')),
  notes               TEXT DEFAULT '',
  on_chain_signature  TEXT,
  verified_at         TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verify_zone ON community_verifications (zone_id);
CREATE INDEX IF NOT EXISTS idx_verify_submitter ON community_verifications (submitter_address);

-- ── Row Level Security ────────────────────────────────────────────────────────

ALTER TABLE flood_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE flood_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE aid_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_verifications ENABLE ROW LEVEL SECURITY;

-- Public read for flood zones + alerts (anyone can see flood data)
CREATE POLICY "flood_zones_public_read" ON flood_zones FOR SELECT USING (true);
CREATE POLICY "flood_alerts_public_read" ON flood_alerts FOR SELECT USING (true);

-- Public read for payouts (transparency)
CREATE POLICY "aid_payouts_public_read" ON aid_payouts FOR SELECT USING (true);

-- Community verifications: public read
CREATE POLICY "verifications_public_read" ON community_verifications FOR SELECT USING (true);

-- Service role can do everything (used by Worker)
CREATE POLICY "service_role_all" ON flood_zones FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_alerts" ON flood_alerts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_payouts" ON aid_payouts FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "service_role_verify" ON community_verifications FOR ALL USING (auth.role() = 'service_role');

-- Authenticated users can insert verifications
CREATE POLICY "auth_insert_verify" ON community_verifications FOR INSERT
  WITH CHECK (auth.role() IN ('authenticated', 'service_role'));

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_flood_zones_updated_at
  BEFORE UPDATE ON flood_zones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
