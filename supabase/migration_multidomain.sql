-- Migration: multi-domain fields for tenants (Plan B / sellable multi-tenant)
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subdomain TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS custom_domain TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_subdomain_unique
  ON tenants(subdomain) WHERE subdomain IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_tenants_custom_domain_unique
  ON tenants(custom_domain) WHERE custom_domain IS NOT NULL;

UPDATE tenants SET subdomain = 'inmobiliaria' WHERE id = 'sec_inmobiliaria_123';
UPDATE tenants SET subdomain = 'arquitectos' WHERE id = 'sec_arquitectos_123';
UPDATE tenants SET subdomain = 'abogados' WHERE id = 'sec_abogados_123';
UPDATE tenants SET subdomain = 'hospedajes' WHERE id = 'sec_hospedajes_123';
