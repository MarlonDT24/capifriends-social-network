## Milestone 1 — Base del proyecto ✅
- [x] Configuración inicial de Next.js 15 + Tailwind CSS 4
- [x] Repositorio Git y estructura de documentación
- [x] Configuración de Supabase (variables env, clientes browser/SSR)
- [x] Sistema de autenticación (signup/login con Supabase Auth)
- [x] Middleware de protección de rutas
- [x] Landing page responsive

## Milestone 2 — Perfil y Feed ✅
- [x] Tabla `profiles` con RLS + trigger de provisioning
- [x] Formulario de edición de perfil con Server Action
- [x] Storage `avatars` (políticas por carpeta)
- [x] Tabla `posts` y feed con listado
- [x] Crear post (texto + imagen)
- [x] Onboarding suave (redirigir a `/profile/edit` si faltan `username` o `avatar`)

## Milestone 3 —  Interacciones Sociales ✅ (MVP)
- [x] Tabla `friendships` + RLS (select/insert/update seguro)
- [x] Envío de solicitud, aceptar/declinar
- [x] Route `/api/notifications/inbox` + Dropdown con acciones
- [x] Contador SSR en campanita

## Milestone 4 — Perfiles Públicos y UX (en progreso)
- [x] Perfiles públicos visitables por URL (/profile/[username])
- [x] Layout de feed con **sidebar izquierda** (navegación) y **derecha** (social)
- [x] Sistema de tabs en perfil (Posts, Guardados, Amigos)
- [x] Acciones avanzadas de amistad (unfriend, cancelar solicitud)
- [x] Mejoras UX en composer y botones
- [x] AddFriendButton inteligente con estados

## Milestone 5 — Avanzado
- [x] Deploy en Vercel (frontend)
- [x] Configuración de Supabase en producción
- [x] Dominio personalizado con SSL
- [x] Variables de entorno en producción
- [x] CI/CD con GitHub Actions
- [x] Monitoreo básico

## Milestone 6 — Posible idea - FAMILIA
- [ ] HACER UNA FUNCIÓN PARA AÑADIR FAMILIA EN EL PERFIL DE CADA USUARIO. Cada usuario podra añadir amigos marcandolos como familia para que le aparezca en el propio perfil. Apareceran los iconos de usario de los perfil denominados como familia justo al lado del numero de familia que tiene cada usuario.
