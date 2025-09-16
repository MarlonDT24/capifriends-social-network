## Milestone 1 — Base del proyecto ✅
- [x] Next.js + Tailwind
- [x] Repo GitHub y documentación base
- [x] Supabase: variables env + clientes (browser/SSR)
- [x] Auth: signup/login + sesión (route group `(auth)`)

## Milestone 2 — Perfil y Feed ✅
- [x] Tabla `profiles` con RLS + trigger de provisioning
- [x] Formulario de edición de perfil con Server Action
- [x] Storage `avatars` (políticas por carpeta)
- [x] Tabla `posts` y feed con listado
- [x] Crear post (texto + imagen)
- [x] Onboarding suave (redirigir a `/profile/edit` si faltan `username` o `avatar`)

## Milestone 3 — Amigos y Notificaciones ✅ (MVP)
- [x] Tabla `friendships` + RLS (select/insert/update seguro)
- [x] Envío de solicitud, aceptar/declinar
- [x] Route `/api/notifications/inbox` + Dropdown con acciones
- [x] Contador SSR en campanita

## Milestone 4 — UX y despliegue (en progreso)
- [ ] Layout de feed con **sidebar izquierda** (navegación) y **derecha** (social)
- [ ] Deploy en Vercel + Supabase (prod)
- [ ] Dominio personalizado

## Milestone 5 — Avanzado
- [ ] Realtime (notificaciones/chat)
- [ ] Sugerencias de usuarios (“gente que quizá conozcas”)
- [ ] Likes y contador en posts
- [ ] Tests (unitarios y e2e)
- [ ] Migración a TypeScript
