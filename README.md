# SASIM — Sabiduría Simple

Plataforma educativa con contenido sobre tecnología, familia y aprendizaje.

## Stack
- **Frontend:** HTML + CSS + Vanilla JS
- **Auth & DB:** Supabase (PostgreSQL + Google OAuth + Storage)
- **Pagos:** MercadoPago (suscripciones CLP $6.000/mes)
- **Hosting:** Cloudflare Pages (auto-deploy desde este repo)
- **Webhook:** Cloudflare Workers (pago → rol → email)
- **Email:** Resend.com

## Estructura
```
├── index.html          — Sitio público
├── admin.html          — Panel de administración
├── css/
│   ├── variables.css   — Design tokens (paleta, fuentes)
│   ├── main.css        — Estilos del sitio público
│   └── admin.css       — Estilos del panel admin
├── js/
│   ├── supabase.js     — Auth + carga de datos
│   ├── app.js          — Navegación + renderizado
│   ├── video-player.js — Modal + progreso de video
│   ├── mercadopago.js  — Suscripciones
│   └── admin.js        — CRUD admin
├── manifest.json       — PWA
├── sw.js               — Service Worker
└── icon-*.png          — Iconos PWA
```

## Deploy
Cada push a `main` se despliega automáticamente en Cloudflare Pages.

**URL producción:** https://sasim-2g5.pages.dev
