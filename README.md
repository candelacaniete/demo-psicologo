# Katem — Catálogo + Funnel multi-tenant vendible

Dominio raíz: **katem.store**

## Plan B (activo ahora): handshake por wa.me

Meta pide verificación de empresa y plantillas Approved para escribir primero.
Hasta que eso esté listo, el funnel funciona así:

1. Lead completa el form → se guarda en Supabase  
2. La web muestra **Continuar por WhatsApp** (`wa.me`)  
3. El lead envía el mensaje precargado (él inicia)  
4. Se abre la ventana de 24h → webhook → agente IA responde en texto libre  

No requiere plantilla Approved ni business verification para el primer contacto.

Cuando Meta apruebe plantillas: `WHATSAPP_HANDSHAKE_MODE=template`.

## Multi-dominio (escalable / vendible)

Misma app, un tenant por cliente:

| Tipo | Ejemplo | Resolución |
|---|---|---|
| Query | `katem.store/funnel?client_id=sec_inmobiliaria_123` | `client_id` |
| Subdominio | `inmobiliaria.katem.store` | `tenants.subdomain` |
| Dominio propio | `www.cliente.com` | `tenants.custom_domain` |

En Vercel: agregar dominios/wildcard `*.katem.store` + dominios custom del cliente.
En DNS del cliente: CNAME → Vercel.

Correr también: `supabase/migration_multidomain.sql`

## Rutas

- `/` catálogo Katem  
- `/psicologos` demo psicóloga  
- `/funnel` landing multi-tenant  
- `/admin` dashboard realtime  
- `/api/webhooks/ycloud` ← `https://katem.store/api/webhooks/ycloud`

## Env mínimas

Ver `.env.example` (`WHATSAPP_HANDSHAKE_MODE=user_initiated` por default).
