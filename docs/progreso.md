# Progreso — Capifriends 2.0

> Diario técnico. Añade entradas por fecha con cambios, decisiones y próximos pasos.

## 2025-08-09
- Se inicializa proyecto Next.js + Tailwind con `create-next-app` (App Router, ESLint, sin TypeScript por ahora).
- Se crea repo en GitHub y se sube el estado inicial.
- Se define estructura de documentación (`README`, `CHANGELOG`, `docs/*`, `.github/*`).

### Próximos pasos inmediatos
- Crear proyecto en Supabase y configurar `.env.local` (URL + ANON KEY).
- Preparar tablas `profiles` y `posts` con RLS.
- Implementar `auth.signUp` y `auth.signInWithPassword` (páginas `/signup` y `/login`).


## 2025-08-20
- Navbar responsive:
  - Logo optimizado (Next/Image), buscador centrado (desktop), selector de idioma persistente y panel móvil.
  - Estructura accesible con `aria-label`, `aria-expanded`, `aria-controls`.
- Home:
  - Sección hero con CTAs, previsualización de feed como skeleton, beneficios y CTA final.
- Design tokens:
  - `background/foreground`, `muted/muted-foreground`, `border`, `brand` y tokens para `header`/`footer`.
- Preparado para siguientes pasos: auth (signup/login) y base de datos `profiles` con RLS.