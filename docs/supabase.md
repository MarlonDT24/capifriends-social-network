# Supabase — Configuración y uso

## 1) Creación del proyecto
- Crear organización y proyecto en https://supabase.com
- Elegir región EU y guardar la contraseña de DB.
- Obtener `Project URL` y `Anon public key` en **Settings → API**.

## 2) Variables de entorno
Crear `.env.local` en la raíz del proyecto y añadir:
```ini
NEXT_PUBLIC_SUPABASE_URL=https://ojeggdvjbbdvqgdnyevl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qZWdnZHZqYmJkdnFnZG55ZXZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2Nzg5MjAsImV4cCI6MjA3MDI1NDkyMH0.tyxTM5jJVC9CVM9Gp3vHQSUYIlFaLbsLuHPuaUIXZqU