# Katem — Landings de conversión multi-nicho

Dominio raíz: **katem.store**

## Flujo WhatsApp (Plan B — activo)

Sin plantillas ni display name de Meta:

1. Lead completa el form (calificación HOT/WARM/COLD en DB)  
2. CTA **Enviar por WhatsApp** (`wa.me` con mensaje precargado)  
3. El cliente **envía** ese mensaje → se abre ventana 24h  
4. Webhook YCloud → agente IA responde en texto libre  

`WHATSAPP_HANDSHAKE_MODE=user_initiated`

Más adelante (cuando Meta termine display name): `=template`.

## Env en Vercel

Ver `.env.example`. Mínimo:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → **publishable** (`sb_publishable_...`)
- `SUPABASE_SERVICE_ROLE_KEY` → **secret** (`sb_secret_...`)
- `YCLOUD_API_KEY` / `YCLOUD_WHATSAPP_FROM`
- `WHATSAPP_HANDSHAKE_MODE=user_initiated`
- `OPENAI_API_KEY` / `OPENAI_MODEL`
- `NEXT_PUBLIC_ROOT_DOMAIN=katem.store`

Webhook YCloud: `https://katem.store/api/webhooks/ycloud`  
evento: `whatsapp.inbound_message.received`

## SQL Supabase

1. `supabase/schema.sql` (si es proyecto nuevo)  
2. `supabase/migration_multidomain.sql`  
3. `supabase/migration_funnel_events.sql`

## Rutas

`/` hub · `/inmobiliaria|/arquitectos|/abogados|/hospedajes` · `/admin` · `/funnel` alias
