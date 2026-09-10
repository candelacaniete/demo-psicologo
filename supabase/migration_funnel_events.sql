-- Funnel analytics events
CREATE TABLE IF NOT EXISTS funnel_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  event_name TEXT NOT NULL,
  niche TEXT NOT NULL,
  tenant_id TEXT,
  lead_id UUID,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_funnel_events_name ON funnel_events(event_name);
CREATE INDEX IF NOT EXISTS idx_funnel_events_niche ON funnel_events(niche);
CREATE INDEX IF NOT EXISTS idx_funnel_events_created ON funnel_events(created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE funnel_events;
