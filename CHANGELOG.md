## Changelog
Este proyecto sigue el formato Keep a Changelog y SemVer.

## [0.2.0] - 2025-08-28
### Added
- Rutas `/login` y `/signup` (route group `(auth)`) con Supabase Auth (`signUp`, `signInWithPassword`).
- Middleware en Edge con `@supabase/ssr`:
  - Protege `/feed` y `/profile/edit`.
  - Redirige a `/feed` si se accede a `/login` o `/signup` con sesión activa.
  - Preserva `redirectedFrom` para volver tras login.
- Navbar dividido:
  - `components/nav/Navbar.jsx` (Server, obtiene `user` y `profile`).
  - `components/nav/NavbarClient.jsx` (Client, buscador, selector idioma, menú usuario).
  - `components/nav/SearchBox.jsx`, `LangSwitcher.jsx`, `UserMenu.jsx`.
- Botón de cierre de sesión `components/SignOutButton.jsx`.
- Página `/profile/edit`:
  - Server Component que obtiene perfil en SSR.
  - `components/profile/EditProfileForm.jsx` (sube avatar a Storage).
  - Server Action `app/profile/edit/actions.js::updateProfile` (RLS).
- Storage `avatars`:
  - Bucket público y policies de `INSERT/UPDATE` limitadas a carpeta `<uid>/...`.
- Reorganización de carpetas:
  - `lib/` (supabaseClient + supabaseServer) fuera de `app/`.
  - `components/nav` y `components/profile` para una UI escalable.

### Changed
- Ajuste de ancho en `SearchBox` y mejoras de accesibilidad.
- Persistencia del idioma en `LangSwitcher` y corrección de estado controlado.

### Fixed
- Error `value is not defined` en `LangSwitcher` (ahora recibe `value` y `onChange` por props).
- Policies duplicadas en Storage/Profiles retiradas.

---

## [0.1.1] - 2025-08-20
### Added
- Navbar responsivo con buscador, selector de idioma, menú móvil.
- Página de inicio con hero, skeletons de feed y beneficios.
- Design tokens y layout global.

### Changed
- Ajustes de accesibilidad y estilos.

### Fixed
- PNGs optimizados y clases Tailwind inconsistentes.

---

## [0.1.0] - 2025-08-09
### Added
- Proyecto inicial con Next.js + Tailwind.
- Documentación base y plantillas de GitHub.
- `.gitignore` para proteger `.env.local`.