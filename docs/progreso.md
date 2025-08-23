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

## 2025-08-23
- Creada tabla `public.profiles`: id (uuid, PK, FK→auth.users ON DELETE CASCADE), username (unique), full_name, avatar_url, bio, created_at (now()).
- RLS pendiente de activar y definir policies.

## 2025-08-23
- DB lista: `public.profiles` + FK→`auth.users` (ON DELETE CASCADE), RLS y policies (select para authenticated, insert/update solo propia fila).
- Función `public.handle_new_user()` + trigger `on_auth_user_created`: provisioning automático de perfiles.
- Índice `profiles_username_lower_idx` para búsquedas insensibles a mayúsculas.
- Configurados clientes Supabase: `app/lib/supabaseClient.js` (browser) y `app/lib/supabaseServer.js` (SSR).
- Próximo: páginas `/signup` y `/login`, protección `/feed`, `/profile/edit` + Storage `avatars`.