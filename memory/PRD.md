# PasionCofrade - PRD

## Original Problem Statement
Página web profesional para empresa de fotografía "PasionCofrade", especializada en venta de fotografías de Semana Santa y eventos cofrades de Sevilla. Diseño elegante con colores grisáceos, blanco, negros y morados. Sistema completo con galería, tienda online, panel admin y chatbot IA.

## Architecture
- **Backend**: FastAPI + MongoDB + Motor (async)
- **Frontend**: React 19 + React Router 7 + Tailwind CSS + Shadcn UI
- **Auth**: JWT email/password con httpOnly cookies
- **Storage**: Emergent Object Storage para fotografías
- **AI**: OpenAI GPT-5 (via Emergent LLM Key) para chatbot

## User Personas
1. **Visitante/Cliente**: Explora galería, compra fotos digitales/físicas, contacta fotógrafos
2. **Administrador**: Sube fotografías, gestiona pedidos, ve estadísticas

## Core Requirements
- Catálogo de fotografías categorizado (Hermandades, Eventos, Pueblos)
- Sistema de carrito de compra con localStorage
- Checkout manual con Bizum/Efectivo
- Panel admin para upload de fotos
- Chatbot IA para consultas sobre tamaños y contratos
- Diseño responsive elegante (dark theme con morados)

## Implementación (Fase 1 - Completada 25/05/2026)
- ✅ Backend completo: auth, photos CRUD, orders, contact, chatbot, categories
- ✅ Frontend completo: 7 páginas (Home, Gallery, About, Contact, Checkout, AdminLogin, AdminDashboard)
- ✅ Sistema de carrito con persistencia
- ✅ Chatbot IA con OpenAI funcional
- ✅ Panel administrativo con upload de fotos
- ✅ Categorías por defecto creadas (Hermandades, Eventos, Pueblos)
- ✅ Object storage integrado para fotografías
- ✅ Diseño dark theme con paleta morada
- ✅ Información fotógrafos actualizada (Gonzalo Lara @gonzalo_0702, Manuel Gómez @_manugfotos)

## Test Credentials
- Admin: admin@pasioncofrade.com / admin123

## Backlog / Next Tasks
### P0 (Crítico)
- Subir fotografías iniciales al sistema (admin debe poblar la galería)

### P1 (Alto valor)
- Añadir watermarks automáticos a fotos
- Email notifications para pedidos (SendGrid/Resend)
- Mejorar SEO con meta tags dinámicos y sitemap
- Brute force protection en auth (5 fails = 15min lockout)

### P2 (Mejoras)
- Búsqueda de fotografías por texto
- Sistema de favoritos para visitantes
- Página de eventos próximos
- Galería con lightbox y zoom
- Newsletter signup
- Sistema de descuentos/cupones

## Known Issues / Notes
- Chatbot button puede solaparse con el badge Emergent (z-index ajustado)
- CORS permite "*" - debería restringirse en producción
- No hay rate limiting en endpoints públicos
