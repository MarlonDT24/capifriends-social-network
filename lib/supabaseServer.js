// lib/supabaseServer.js
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Para Server Components (RSC): solo LECTURA de cookies.
 * Evita el error "Cookies can only be modified..."
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        // No-ops en RSC: Next 15 no permite escribir cookies aquí
        set() {},
        remove() {},
      },
    }
  );
}

/**
 * Para Server Actions / Route Handlers: LECTURA + ESCRITURA de cookies.
 * Aquí sí podemos hacer cookieStore.set/remove.
 */
export async function createServerSupabaseAction() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set(name, value, options);
        },
        remove(name, options) {
          cookieStore.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );
}
