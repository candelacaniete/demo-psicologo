# Katem — Landings de conversión multi-nicho

Dominio raíz: **katem.store**

## Producto

Landings de conversión por vertical con:

1. Formulario en **2 pasos** (calificación + contacto)
2. Score HOT / WARM / COLD guardado en Supabase
3. Continuidad por **WhatsApp** (`wa.me`, modo user-initiated)
4. Tracking de embudo (`funnel_events`) + admin realtime

## Rutas

| Ruta | Qué es |
|---|---|
| `/` | Hub de landings + link a Admin |
| `/inmobiliaria` `/arquitectos` `/abogados` `/hospedajes` | Landings de conversión |
| `/admin` | Dashboard leads + métricas de embudo |
| `/funnel` | Alias (redirige / renderiza la landing) |
| `/psicologos` | Demo clínica (legacy) |
| `/api/webhooks/ycloud` | Webhook WhatsApp |

## Multi-dominio

| Tipo | Ejemplo | Resolución |
|---|---|---|
| Path | `katem.store/inmobiliaria` | niche route |
| Query | `?client_id=sec_inmobiliaria_123` | tenant |
| Subdominio | `inmobiliaria.katem.store` | `tenants.subdomain` → rewrite |
| Dominio propio | `www.cliente.com` | `tenants.custom_domain` |

## SQL a correr en Supabase

1. `supabase/schema.sql` (base)
2. `supabase/migration_multidomain.sql`
3. **`supabase/migration_funnel_events.sql`** ← eventos del embudo

## Handshake WhatsApp (Plan B)

Meta bloquea texto libre outbound sin ventana 24h. Flujo activo:

1. Lead completa el form → calificación en DB  
2. CTA **Continuar por WhatsApp** (`wa.me`)  
3. El lead inicia el chat → webhook → agente IA  

`WHATSAPP_HANDSHAKE_MODE=user_initiated` (default).

## Env mínimas

Ver `.env.example`.
