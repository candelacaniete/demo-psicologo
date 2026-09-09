# Katem — Catálogo de demos + Funnel multi-tenant

## Rutas

- `/` — home del catálogo (identidad Katem)
- `/psicologos` — demo ficticia Dra. Camila Ríos
- `/funnel?nicho=inmobiliaria&client_id=sec_inmobiliaria_123` — landing multi-tenant
- `/admin` — dashboard realtime de leads

## Flujo AI multi-tenant

1. Landing captura lead con `client_id` → `POST /api/leads/capture`
2. Lead queda bajo `tenant_id` + bienvenida WhatsApp con API key del tenant
3. Respuestas llegan a `/api/webhooks/ycloud`
4. `runAIAgent` carga historial, system prompt del nicho + custom del tenant, y usa tools:
   - `saveCollectedData`
   - `qualifyLead`
   - `sendWhatsAppInteractive`
5. Admin ve métricas/leads en vivo

## Setup

Dominio de producción: **https://katem.store**

```bash
cp .env.example .env.local
# completar Supabase + YCLOUD_* + OPENAI_API_KEY
```

1. Ejecutá `supabase/schema.sql` en Supabase.
2. En YCloud, apuntá el webhook de mensajes entrantes a:

```text
https://katem.store/api/webhooks/ycloud
```

3. Probá la landing:

```text
https://katem.store/funnel?nicho=inmobiliaria&client_id=sec_inmobiliaria_123
```

4. Dashboard:

```text
https://katem.store/admin
```

```bash
npm install
npm run dev
```
