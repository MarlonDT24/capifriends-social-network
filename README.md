# Capifriends

Capifriends es la evolución de una red social educativa a una aplicación moderna construida con **Next.js (App Router) + Tailwind CSS + Supabase (PostgreSQL)**.  
El objetivo es aprender un stack actual y, al mismo tiempo, construir una base sólida para funcionalidades sociales reales como autenticación, perfiles, publicaciones, likes, comentarios y actualizaciones en tiempo real.

---

## 🧱 Stack Tecnológico

- **Frontend**: Next.js 14+ (App Router), React 18, Tailwind CSS
- **Backend**: Supabase (PostgreSQL gestionado, Auth, Storage, RLS)
- **Infraestructura**: Vercel (frontend), Supabase (BD y backend)
- **Calidad**: ESLint, Prettier, Conventional Commits, GitHub Actions (futuro)

---

## 🔧 Requisitos Previos

- Node.js LTS (≥ 20)
- npm (≥ 10)
- Cuenta en Supabase

---

## 🚀 Puesta en Marcha en Local

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/<usuario>/capifriends-social-network
   cd capifriends

2. **Instalar dependencias**
  ```bash
  npm install
  ```

3. **Configurar variables de entorno**

  Copiar el archivo de ejemplo:

  ```bash
  cp .env.example .env.local
  ```
  Rellenar con tus credenciales de Supabase:
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_PUBLIC_KEY
  ```

4. **Ejecutar en modo desarrollo**
  ```bash
  npm run dev
  ```
Abrir en navegador: http://localhost:3000

## ⚙️ Scripts Disponibles
npm run dev → Inicia el servidor de desarrollo

npm run build → Genera el build de producción

npm run start → Sirve el build en producción

npm run lint → Ejecuta ESLint para verificar la calidad del código

## 🗺️ Documentación del Proyecto
Toda la documentación se encuentra en la carpeta docs/ e incluye:

progreso.md → Registro cronológico de cambios y avances

arquitectura.md → Estructura y decisiones técnicas

supabase.md → Configuración y uso de Supabase

convenciones.md → Reglas de commits, ramas y estilo

roadmap.md → Plan de desarrollo y fases

checklists.md → Listas de control para PRs y releases

## 📄 Licencia
Este proyecto está bajo licencia MIT. Puedes usarlo, modificarlo y distribuirlo libremente.
