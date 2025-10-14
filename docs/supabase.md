# Supabase — Configuración y uso

## 1) Creación del proyecto
- Crear organización y proyecto en https://supabase.com
- Elegir región EU y guardar la contraseña de DB.
- Obtener `Project URL` y `Anon public key` en **Settings → API**.

## 2) Variables de entorno
Crear `.env.local` en la raíz del proyecto y añadir:
```ini
NEXT_PUBLIC_SUPABASE_URL=TU_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY



# Supabase — Esquema, RLS y Clientes

## 1. Esquema de base de datos

**Tabla:** `public.profiles` (1:1 con `auth.users`)

| Columna     | Tipo        | Nulo | Default | Notas |
|-------------|-------------|------|---------|-------|
| id          | uuid        | NO   | —       | **PK**, **FK** → `auth.users(id)` **ON DELETE CASCADE** |
| username    | text        | SÍ   | —       | **UNIQUE** (índice único implícito) |
| full_name   | text        | SÍ   | —       |  |
| avatar_url  | text        | SÍ   | —       | ruta pública al bucket `avatars` (cuando exista) |
| bio         | text        | SÍ   | —       |  |
| created_at  | timestamptz | NO   | `now()` |  |

**Índices adicionales:**
- `profiles_username_lower_idx` sobre `lower(username)` para búsquedas case-insensitive.

## 2. RLS y Policies

**RLS:** Activado en `public.profiles`.

**Policies (role = authenticated):**
- **SELECT** → `Allow read for authenticated` → `USING (true)`
- **INSERT** → `Insert own profile` → `WITH CHECK (id = auth.uid())`
- **UPDATE** → `Update own profile` → `USING (id = auth.uid())` y `WITH CHECK (id = auth.uid())`

> Resultado: usuarios autenticados pueden leer todos los perfiles; cada usuario solo puede crear/editar **su propia** fila.

## 3. Provisioning automático de perfiles

**Función:** `public.handle_new_user()`
- Inserta una fila en `public.profiles` tras `INSERT` en `auth.users`.
- Copia metadatos cuando existen (`full_name`, `avatar_url`/`picture`), fija `created_at = now()`.
- `ON CONFLICT (id) DO NOTHING` para ser idempotente.

**Trigger:** `on_auth_user_created` (AFTER INSERT on `auth.users`) → ejecuta `public.handle_new_user()`.

## 4. Clientes Supabase (Next.js App Router)

**Cliente de navegador:** `app/lib/supabaseClient.js`
```js
"use client";
import { createClient } from "@supabase/supabase-js";
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);