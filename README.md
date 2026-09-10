# Katem — Landings de conversión multi-nicho

Dominio raíz: **katem.store**

## Producto

Landings de conversión por vertical con:

1. Formulario en **2 pasos** (calificación + contacto)
2. Score HOT / WARM / COLD guardado en Supabase
3. Primer contacto por **plantilla WhatsApp** (aprobada) + continuidad IA
4. Tracking de embudo (`funnel_events`) + admin realtime

## Handshake WhatsApp (Plan A activo)

Con cuenta de empresa verificada + plantilla **Approved** (aunque sea categoría **MARKETING**):

1. Lead completa el form → calificación en DB  
2. El backend envía `followuplead` por YCloud (`nombres`, `empresa`)  
3. El lead responde → se abre ventana 24h → agente IA en texto libre  

`WHATSAPP_HANDSHAKE_MODE=template` (default).

- Si el template falla → fallback automático a `wa.me`
- Leads `DISCARDED` no consumen plantilla marketing (límite de calidad/volumen)

Marketing vs Utility: para follow-up de leads Meta suele clasificar como Marketing. Funciona igual para abrir la conversación; solo cambia pricing/límites de mensajería marketing.

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

## Env mínimas

Ver `.env.example`. En Vercel setear:

```
WHATSAPP_HANDSHAKE_MODE=template
YCLOUD_WELCOME_TEMPLATE_NAME=followuplead
YCLOUD_WELCOME_TEMPLATE_LANG=es
YCLOUD_WELCOME_TEMPLATE_CATEGORY=MARKETING
```
