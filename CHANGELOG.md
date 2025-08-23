## Changelog
Este proyecto sigue el formato Keep a Changelog
y el versionado semántico SemVer.

[0.1.0] - 2025-08-09
Added
- Proyecto inicial con Next.js 14 + Tailwind CSS usando App Router.
- Configuración de ESLint y package.json por defecto.
- Documentación base:
    - README.md con instrucciones de instalación y stack.
    - .env.example para variables de entorno.
    - Carpeta /docs con archivos iniciales: progreso, arquitectura, supabase, convenciones, roadmap, checklists.
    - Carpeta .github/ con plantillas de Issues y Pull Requests.

- Configuración de .gitignore para proteger .env.local.

## [0.1.1] - 2025-08-20
### Added
- Navbar responsivo con buscador, selector de idioma, menú móvil y frase de enganche.
- Página de inicio con hero, skeletons de feed y beneficios.
- Sistema de design tokens (bg/fg, brand, muted, border) y tokens específicos para header/footer.
### Changed
- Layout global: estructura semántica, accesibilidad y separación visual header/main/footer.
### Fixed
- Logos PNG optimizados y clases Tailwind inconsistentes.

[Unreleased]
Planned
- Conexión con Supabase (Auth + PostgreSQL).
- Tablas profiles y posts con Row Level Security (RLS).
- Páginas /signup y /login para autenticación de usuarios.
- Estado de sesión global y rutas protegidas.
- Documentación extendida en /docs/supabase.md.

## [Unreleased]
### Added
- `public.profiles` table with 1:1 relation to `auth.users` and unique `username`.

## [Unreleased]
### Added
- Database: `public.profiles` (1:1 con `auth.users`), RLS activado y policies de propiedad.
- Provisioning: función `handle_new_user()` + trigger `on_auth_user_created`.
- Infra: clientes Supabase (`supabaseClient.js` y `supabaseServer.js`) para browser y SSR.
### Security
- Row Level Security habilitado y políticas de lectura/escritura por usuario.