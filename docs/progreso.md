# Progreso — Capifriends 2.0

> Diario técnico. Añade entradas por fecha con cambios, decisiones y próximos pasos.

## 09-08-2025
- Se inicializa proyecto Next.js + Tailwind con `create-next-app` (App Router, ESLint, sin TypeScript por ahora).
- Se crea repo en GitHub y se sube el estado inicial.
- Se define estructura de documentación (`README`, `CHANGELOG`, `docs/*`, `.github/*`).

### Próximos pasos inmediatos
- Crear proyecto en Supabase y configurar `.env.local` (URL + ANON KEY).
- Preparar tablas `profiles` y `posts` con RLS.
- Implementar `auth.signUp` y `auth.signInWithPassword` (páginas `/signup` y `/login`).

---

## 20-08-2025
- Navbar responsive:
  - Logo optimizado (Next/Image), buscador centrado (desktop), selector de idioma persistente y panel móvil.
  - Estructura accesible con `aria-label`, `aria-expanded`, `aria-controls`.
- Home:
  - Sección hero con CTAs, previsualización de feed como skeleton, beneficios y CTA final.
- Design tokens:
  - `background/foreground`, `muted/muted-foreground`, `border`, `brand` y tokens para `header`/`footer`.
- Preparado para siguientes pasos: auth (signup/login) y base de datos `profiles` con RLS.

---

## 23-05-2025 (mañana)
- Creada tabla `public.profiles`: id (uuid, PK, FK→auth.users ON DELETE CASCADE), username (unique), full_name, avatar_url, bio, created_at (now()).
- RLS pendiente de activar y definir policies.

## 23-08-2025 (tarde)
- DB lista: `public.profiles` + FK→`auth.users` (ON DELETE CASCADE), RLS y policies (select para authenticated, insert/update solo propia fila).
- Función `public.handle_new_user()` + trigger `on_auth_user_created`: provisioning automático de perfiles.
- Índice `profiles_username_lower_idx` para búsquedas insensibles a mayúsculas.
- Configurados clientes Supabase: `app/lib/supabaseClient.js` (browser) y `app/lib/supabaseServer.js` (SSR).
- Próximo: páginas `/signup` y `/login`, protección `/feed`, `/profile/edit` + Storage `avatars`.

---

## 24-08-2025
- Reorganizadas rutas de autenticación en route group `(auth)` para exponer URLs limpias: /login y /signup.
- (Opcional) Añadido layout específico para `(auth)` con formularios centrados.

---

## 25-08-2025
**Middleware**
- Implementado `middleware.js` con `@supabase/ssr` para leer/escribir cookies de sesión en Edge.
- Protegidas rutas `/feed` y `/profile/edit`.
- Si intentas entrar a `/login` o `/signup` con sesión activa → redirección a `/feed`.
- Se preserva `redirectedFrom` para volver a donde el usuario quería ir tras iniciar sesión.

---

## 26-08-2025
**Navbar profesionalizado (SSR + CSR)**
- `components/Navbar.jsx` (Server): obtiene sesión y perfil en SSR y **delegan** a…
- `components/NavbarClient.jsx` (Client): buscador, selector de idioma, menú de usuario (perfil y logout).
- `components/nav`:
  - `SearchBox.jsx` (ancho ajustable, controla `onSubmit`).
  - `LangSwitcher.jsx` (persistencia en localStorage).
  - `UserMenu.jsx` (muestra links de cuenta si hay sesión).
- `components/SignOutButton.jsx`: botón de logout con `supabase.auth.signOut()` y refresh.

**Correcciones**
- Error `value is not defined` en `LangSwitcher` → ahora recibe `value`/`onChange` por props.

---

## 27-08-2025
**Edición de perfil**
- Ruta protegida `/profile/edit` (Server Component) con:
  - Lectura del perfil en SSR (`createServerSupabase()`).
  - Formulario **cliente** `components/profile/EditProfileForm.jsx`.
  - Server Action `app/profile/edit/actions.js::updateProfile` para `UPDATE` respetando RLS.
- **Storage (bucket `avatars`)**:
  - Bucket público.
  - Políticas en `storage.objects` limitando `INSERT/UPDATE` a carpeta `<auth.uid()>/*`.
  - Subida desde cliente → ruta `${uid}/${timestamp}_${filename}`, URL pública guardada en `profiles.avatar_url`.

---

## 28-08-2025
**Feed mínimo (servidor + placeholder)**
- Página `/feed` (SSR) que:
  - Lee usuario y su perfil básico (saludo).
  - Muestra placeholder de feed + botón de cerrar sesión.
- Estructura de carpetas consolidada:
  - `app/(auth)/{login,signup}/page.jsx`
  - `app/profile/edit/{page.jsx, actions.js}`
  - `components/nav/*`, `components/profile/*`, `components/SignOutButton.jsx`
  - `lib/{supabaseClient.js, supabaseServer.js}` (fuera de `app` para compartir entre server/client con imports limpios).
  
## 29-08-2025
**Edición de perfil**
- `/profile/edit` (SSR) + `EditProfileForm.jsx` (cliente).
- Server Action `updateProfile`.
- **Storage (bucket `avatars`)**: políticas por carpeta `<auth.uid()>/*`.

---

## 30-08-2025
**Posts y Feed**
- Tabla `posts` con RLS (author_id = auth.uid()).
- `PostComposer.jsx`: subida a bucket `post-images` y `createPost` (Server Action).
- `/feed`: listado SSR con join a `profiles`.

---

## 10-09-2025
**Amigos (parte 1)**
- Tabla `friendships` (requester_id, addressee_id, status `pending|accepted|declined`, created_at).
- RLS:
  - SELECT: visible si `auth.uid()` es requester o addressee.
  - INSERT: `requester_id = auth.uid()` y `requester_id <> addressee_id`.
  - UPDATE: solo el **addressee** puede aceptar/declinar su fila.
- Índice/constraint de unicidad (pareja única con `LEAST/GREATEST`) para evitar duplicados.

---

## 12-09-2025
**Notificaciones**
- Route Handler `/api/notifications/inbox` devuelve solicitudes **pending** dirigidas a mí con datos del solicitante.
- `NotificationsDropdown.jsx`: lista con **Confirmar**/**Rechazar** (Server Actions).
- `NotificationsBell` (Server) calcula contador inicial SSR.

---

## 14-09-2025
**Búsqueda**
- `/search`: resultados de perfiles (`profiles.username/full_name/avatar_url`) con botón **Agregar** (envía `sendFriendRequest`).
- UX: también se puede pasar `addressee_id` oculto si ya lo conocemos.

---

## 15-09-2025
**Pulidos y fixes**
- Signout sin FOUC de sesión: `router.refresh()` tras `auth.signOut()` y protección en middleware.
- Arreglos de estilos (popover, avatar dentro del círculo con `object-cover`).
- Corrección Server Action con formularios: evitar `encType`/`method` cuando se pasa `action={fn}`.

---

## 16-09-2025
**Calidad de vida DEV**
- Doc “semillas”: script o panel Supabase para crear usuarios **auto-confirmados** de prueba.
- Pasos de test manual: flujo de solicitud/aceptación, contador de campanita, y RLS efectiva.

---

## 20-09-2025
**Sistema de Bookmarks (Guardados)**
- Tabla **post_bookmarks** con RLS similar a **post_likes**.
- Server Action toggleBookmark en /app/feed/post-actions.js.
- Contador **bookmarks_count** en posts.
- UI: icono de bookmark en PostCard.jsx con toggle visual.

---

## 22-09-2025
**Sistema de Comentarios**
- Tabla **comments**:
  - Campos: id, post_id (FK→posts), author_id (FK→auth.users), content, created_at.
  - RLS: SELECT público, INSERT propio, DELETE solo del autor..
- Server Actions en **/app/comments/actions.js**:
  - `createComment`: validación de longitud, insert con RLS.
  - `deleteComment`: solo el autor puede borrar.
- Componente **CommentsPanel.jsx**:
  - Listado de comentarios con avatar, username, timestamp.
  - Formulario inline para añadir comentario.
  - Botón eliminar (solo visible si eres autor).
- Contador **comments_count** en tabla posts actualizado automáticamente.

---

## 25-09-2025
**Perfiles Públicos (/profile/[username])**
- Ruta dinámica /app/profile/[username]/page.jsx:
  - SSR: obtiene perfil por username (404 si no existe).
  - Detecta si isOwnProfile (currentUserId === profile.id).
  - Consulta estadísticas: postsCount, friendsCount.
  - Verifica friendshipStatus entre usuario actual y perfil visitado.

- Componente **ProfileHeader.jsx**:
  - Banner con gradiente ocean.
  - Avatar grande con indicador online.
  - Botones contextuales:
    - `Propio perfil`: "Editar perfil".
    - `Otro usuario`: "Agregar amigo" / "Solicitud enviada" / "Aceptar/Rechazar" / "Amigos".
  - Estadísticas (posts, amigos).
  - Bio y fecha de registro.
  - Botón compartir perfil (Web Share API + fallback clipboard).

---

## 27-09-2025
**Tabs de Perfil**
- Componente **ProfileTabs.jsx**:
  - Tab `Posts`: muestra posts del usuario con PostCard.
  - Tab `Guardados`: solo visible si isOwnProfile, muestra posts bookmarked.
  - Tab `Amigos`: lista de amigos con avatares, links a perfiles.
- Integración con **PostCard** para mostrar likes/bookmarks del usuario actual.
- Feed enriquecido: cada post lleva `user_liked` y `user_bookmarked` según consulta previa.

---

## 29-09-2025
**Acciones Avanzadas de Amistad**
- **unfriendAction** en /app/friends/actions.js:
  - Borra fila `accepted` en cualquier dirección (requester/addressee).
  - Revalida /, /friends, /search.
- **cancelFriendRequestAction**:
  - Borra solicitud pending que YO envié.
- Lógica en **ProfileHeader.jsx**:
  - Botón "Amigos" → al hacer click muestra opción "Dejar de ser amigos".
  - Botón "Solicitud enviada" → permite cancelar.
- Manejo de estados pending/accepted/declined con UI clara.

---

## 01-10-2025
**AddFriendButton Inteligente**
- Componente **AddFriendButton.jsx** usado en /search:
  - Detecta relación existente (pending/accepted) vía prop relationship.
  - Muestra botón apropiado:
    - Ninguna relación → "Agregar".
    - Pending (enviada por mí) → "Pendiente" (permite cancelar).
    - Pending (recibida) → "Responder" (acepta/declina).
    - Accepted → "Amigos" (permite unfriend).
- Mejora UX en búsqueda: usuarios ven estado actualizado sin recargar manualmente.

---

## 03-10-2025
**Refactorización de Clientes Supabase**
- Migración a @supabase/ssr:
  - **lib/supabaseClient.js** → createBrowserSupabaseClient() con createBrowserClient.
  - **lib/supabaseServer.js**:
    - createServerSupabase() (solo lectura, para RSC).
    - createServerSupabaseAction() (lectura/escritura, para Server Actions).
- Limpieza de imports: todos los Server Components usan `createServerSupabase()`.
- Todas las Server Actions usan `createServerSupabaseAction()` si necesitan escribir cookies.