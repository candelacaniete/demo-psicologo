# Katem — Catálogo de demos + Funnel multi-nicho

## Rutas

- `/` — home del catálogo (identidad Katem)
- `/psicologos` — demo ficticia Dra. Camila Ríos
- `/funnel?nicho=inmobiliaria` — landing dinámica multi-nicho (funnel)
- `/admin` — dashboard realtime de leads

Nichos soportados: `inmobiliaria`, `arquitectos`, `abogados`, `hospedajes`.

## Funnel (arquitectura)

```
Landing /funnel → POST /api/leads/capture → Supabase + WhatsApp (YCloud)
       ↓
Webhook /api/webhooks/ycloud → BotEngine (JSON flows) → Supabase
       ↓
Admin /admin (Realtime)
```

### Archivos clave

- `supabase/schema.sql`
- `src/types/funnel.ts`
- `src/config/niches.ts`
- `src/lib/adapters/ycloud.adapter.ts`
- `src/lib/engine/stateMachine.ts`
- `src/templates/*.flow.json`
- `app/funnel/page.tsx`
- `app/admin/page.tsx`
- `app/api/leads/capture/route.ts`
- `app/api/webhooks/ycloud/route.ts`

### Setup

1. Copiá `.env.example` → `.env.local` y completá:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `YCLOUD_API_KEY`
   - `YCLOUD_WHATSAPP_FROM`
2. Ejecutá `supabase/schema.sql` en el SQL editor de Supabase.
3. Apuntá el webhook de YCloud a `https://TU_DOMINIO/api/webhooks/ycloud`.

```bash
npm install
npm run dev
```
