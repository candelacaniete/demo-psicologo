-- Multi-tenant conversion funnel schema
-- Run in Supabase SQL editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
    CREATE TYPE lead_status AS ENUM (
      'NEW',
      'IN_QUALIFICATION',
      'QUALIFIED_HOT',
      'DISCARDED'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'niche_type') THEN
    CREATE TYPE niche_type AS ENUM (
      'inmobiliaria',
      'arquitectos',
      'abogados',
      'hospedajes'
    );
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_sender') THEN
    CREATE TYPE message_sender AS ENUM ('user', 'bot');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  niche niche_type NOT NULL,
  ycloud_api_key TEXT NOT NULL,
  whatsapp_from TEXT NOT NULL,
  custom_system_prompt TEXT,
  primary_color TEXT,
  hero_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  tenant_id TEXT NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  niche niche_type NOT NULL,
  status lead_status NOT NULL DEFAULT 'NEW',
  source TEXT NOT NULL DEFAULT 'landing',
  initial_interest TEXT,
  UNIQUE (tenant_id, phone)
);

CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL UNIQUE REFERENCES leads(id) ON DELETE CASCADE,
  current_step TEXT NOT NULL DEFAULT 'welcome',
  collected_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_qualified BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  sender message_sender NOT NULL,
  content TEXT NOT NULL,
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tenants_whatsapp_from ON tenants(whatsapp_from);
CREATE INDEX IF NOT EXISTS idx_leads_tenant_id ON leads(tenant_id);
CREATE INDEX IF NOT EXISTS idx_leads_niche ON leads(niche);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_lead_id ON conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_lead_id ON messages(lead_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);

CREATE OR REPLACE FUNCTION set_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_conversations_updated_at ON conversations;
CREATE TRIGGER trg_conversations_updated_at
BEFORE UPDATE ON conversations
FOR EACH ROW
EXECUTE FUNCTION set_conversations_updated_at();

ALTER PUBLICATION supabase_realtime ADD TABLE tenants;
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Demo seed (replace API keys in production)
INSERT INTO tenants (id, name, niche, ycloud_api_key, whatsapp_from, custom_system_prompt)
VALUES
  (
    'sec_inmobiliaria_123',
    'Inmobiliaria Demo Sur',
    'inmobiliaria',
    COALESCE(NULLIF(current_setting('app.settings.ycloud_api_key', true), ''), 'REPLACE_ME'),
    COALESCE(NULLIF(current_setting('app.settings.ycloud_from', true), ''), 'REPLACE_ME'),
    'Representás a Inmobiliaria Demo Sur.'
  ),
  (
    'sec_arquitectos_123',
    'Estudio Norte Arquitectura',
    'arquitectos',
    COALESCE(NULLIF(current_setting('app.settings.ycloud_api_key', true), ''), 'REPLACE_ME'),
    COALESCE(NULLIF(current_setting('app.settings.ycloud_from', true), ''), 'REPLACE_ME'),
    'Representás a Estudio Norte.'
  ),
  (
    'sec_abogados_123',
    'Estudio Legal Atlas',
    'abogados',
    COALESCE(NULLIF(current_setting('app.settings.ycloud_api_key', true), ''), 'REPLACE_ME'),
    COALESCE(NULLIF(current_setting('app.settings.ycloud_from', true), ''), 'REPLACE_ME'),
    'Representás a Estudio Legal Atlas.'
  ),
  (
    'sec_hospedajes_123',
    'Boutique Stay Patagonia',
    'hospedajes',
    COALESCE(NULLIF(current_setting('app.settings.ycloud_api_key', true), ''), 'REPLACE_ME'),
    COALESCE(NULLIF(current_setting('app.settings.ycloud_from', true), ''), 'REPLACE_ME'),
    'Representás a Boutique Stay Patagonia.'
  )
ON CONFLICT (id) DO NOTHING;
