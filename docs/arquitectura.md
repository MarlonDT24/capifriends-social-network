# Arquitectura

## Stack
- **Next.js (App Router)** — UI + SSR/SSG + Server Actions.
- **React 19** — Componentes, hooks, Server/Client Components
- **Supabase** — PostgreSQL, Auth (email+password), Storage, Row Level Security.
- **Tailwind CSS** — utilidades y theming con design tokens.
- **Lucide React** — Iconografía consistente

## Enrutado (App Router)
- Rutas públicas: `/`, `/login`, `/signup`.
- Rutas protegidas: `/feed`, `/profile/edit` (y próximamente `/onboarding`).
- **Route Group `(auth)`**: organiza vistas de autenticación sin prefijo en la URL.
  
  ## Autenticación y sesión
- **Cliente navegador**: `lib/supabaseClient.js` (createBrowserClient).
- **SSR / RSC (solo lectura de cookies)**: `lib/supabaseServer.js::createServerSupabase()`.
- **Server Actions / Route Handlers (lectura + escritura de cookies)**:  
  `lib/supabaseServer.js::createServerSupabaseAction()`.
- **Middleware de sesión** (`middleware.js`): crea un client Edge que **lee/escribe cookies**
  para proteger rutas y redirigir coherentemente:
  - Si visitas `/feed` o `/profile/edit` sin sesión → redirige a `/login?redirectedFrom=...`.
  - Si ya tienes sesión y entras a `/login` o `/signup` → redirige a `/feed`.

> Tras **login** o **logout**, hacemos `router.refresh()` en cliente para rehidratar el
> árbol con las cookies nuevas y que el **Navbar** se actualice sin recargar manual.

## Flujo de datos (patrón recomendado)
- **Server Components** (páginas principales) hacen la lectura SSR con `createServerSupabase`.
- La UI interactiva vive en **Client Components**:
  - `NavbarClient` (buscador, idioma, menú usuario, campanita).
  - `EditProfileForm`, `PostComposer`, `NotificationsDropdown`, etc.
- Las mutaciones se ejecutan en **Server Actions** (INSERT/UPDATE) que respetan RLS:
  - Perfil: `/app/profile/edit/actions.js::updateProfile`.
  - Posts: `/app/feed/actions.js::createPost`.
  - Amistades: `/app/friends/actions.js::{sendFriendRequest, accept..., decline...}`.

## Módulos principales

### Navbar
- **Server**: `components/Navbar.jsx` carga sesión, perfil y contador de notificaciones (solicitudes pendientes).
- **Client**: `components/NavbarClient.jsx` renderiza buscador, `LangSwitcher`, `NotificationsDropdown` y `UserMenu`.

### Perfil
- Página protegida `/profile/edit` con formulario cliente (`EditProfileForm.jsx`) y **upload a Storage** (`avatars/<uid>/...`).
- Onboarding “suave”: si al entrar a `/feed` faltan `username` o `avatar_url`, se redirige a `/profile/edit?onboarding=1`.

### Feed + Posts
- Página `/feed` (SSR): lista posts y muestra el **composer** para crear uno:
  - `PostComposer.jsx` sube imágenes a bucket `post-images` y llama a `createPost` (Server Action).
  - Post = texto + (opcional) imagen pública.

### Amigos y notificaciones
- **Tabla `friendships`** con RLS. Estados: `pending | accepted | declined`.
- **Campanita**: contador SSR (pendientes dirigidas a mí).
- **Dropdown**: `/api/notifications/inbox` (Route Handler) devuelve solicitudes pendientes con datos del solicitante; en cada item hay **Confirmar/Rechazar** (Server Actions).
- Búsqueda (`/search`): resultados de perfiles con botón **Agregar** (envía `sendFriendRequest`).

## Theming
- `globals.css` define **design tokens CSS**: `--background`, `--foreground`, `--muted`, `--border`, `--brand`, más tokens para `header/footer`.
- Se usan variables en Tailwind vía `@theme inline` (colores semánticos como `bg-background`, `text-muted-foreground`, etc.).
