# Katem — Landings de conversión multi-nicho

Dominio: **katem.store**

## Flujo WhatsApp (único)

1. Form → califica y guarda en Supabase  
2. CTA **Enviar por WhatsApp** (`wa.me` con datos precargados)  
3. Cliente envía → ventana 24h  
4. Webhook YCloud → **OpenAI** responde (YCloud solo transporta)

**No se envían plantillas** desde el formulario.

## Env Vercel

| Variable | Origen |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Publishable (`sb_publishable_...`) |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret (`sb_secret_...`) |
| `NEXT_PUBLIC_ROOT_DOMAIN` | `katem.store` |
| `YCLOUD_API_KEY` | YCloud API key |
| `YCLOUD_WHATSAPP_FROM` | `+15553082749` |
| `WHATSAPP_HANDSHAKE_MODE` | `user_initiated` |
| `OPENAI_API_KEY` | OpenAI |
| `OPENAI_MODEL` | `gpt-4o-mini` |

Webhook: `https://katem.store/api/webhooks/ycloud`  
evento: `whatsapp.inbound_message.received`

En YCloud: apagar AI/auto-reply propio.

## SQL

1. `supabase/schema.sql`  
2. `supabase/migration_multidomain.sql`  
3. `supabase/migration_funnel_events.sql`
