"use server";
/**
 * Server Action de registro.
 * - Crea usuario en Supabase Auth.
 * - Si hay sesión al terminar (confirmación por email desactivada):
 *     - Upsert de la fila en public.profiles (respeta RLS: id = auth.uid()).
 *     - Resuelve conflictos de username si ya existe (reintentos con sufijo).
 *     - Redirige al /feed.
 * - Si NO hay sesión (confirmación por email activada):
 *     - Devuelve un mensaje para que el usuario confirme su correo.
 */
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabaseServer";

// Avatar por defecto servido desde /public (no pasa por Storage)
const DEFAULT_AVATAR_URL = "/profile_icon.png";

// Normaliza el username al formato permitido: [a-z0-9_.]{3,20}
function sanitizeUsername(s = "") {
  let out = s.toLowerCase().replace(/[^a-z0-9_.]/g, "_");
  if (out.length < 3) out = out.padEnd(3, "x");
  if (out.length > 20) out = out.slice(0, 20);
  return out;
}

/**
 * Crea/actualiza el perfil. Si el username choca con la unique constraint,
 * reintenta con un sufijo aleatorio (hasta 5 veces).
 */
async function upsertProfileWithUniqueUsername(
  supabase,
  userId,
  baseUsername,
  fullName
) {
  let candidate = baseUsername || "user";
  for (let i = 0; i < 5; i++) {
    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId, // <- RLS: debe coincidir con auth.uid()
        username: candidate,
        full_name: fullName || "",
        avatar_url: DEFAULT_AVATAR_URL, // <- ruta local en /public
        bio: "",
      },
      { onConflict: "id" } // <- upsert por id, evita duplicados por id
    );

    if (!error) return { ok: true, username: candidate };

    // 23505 = unique_violation (username ya existe en otra fila)
    if (error.code === "23505") {
      candidate = `${baseUsername}_${Math.floor(Math.random() * 1000)}`;
      continue;
    }
    // Otro error
    return { ok: false, message: error.message };
  }
  return { ok: false, message: "No se pudo asignar un username único." };
}

export async function signupAction(prevState, formData) {
  // Cliente SSR que usa cookies de Next (Next 15: cookies() es async dentro)
  const supabase = await createServerSupabase();

  // 1) Parseo de campos del formulario
  const emailRaw = formData.get("email")?.toString() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const full_name = formData.get("full_name")?.toString().trim() ?? "";
  let username = formData.get("username")?.toString().trim() ?? "";

  const email = emailRaw.trim().toLowerCase();
  if (!email || !password) {
    return { ok: false, message: "Email y contraseña son obligatorios." };
  }

  // Si no entra username, usamos la parte local del email; luego sanitizamos
  if (!username && email) username = email.split("@")[0];
  username = sanitizeUsername(username);

  // 2) Alta en Auth (enviamos metadata útil —no imprescindible— para trazabilidad)
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
        username,
        avatar_url: DEFAULT_AVATAR_URL, // sólo metadato; el valor de verdad se guarda en profiles
      },
    },
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  // 3) Si confirmación por email está ACTIVADA, aquí no habrá session todavía
  if (!data.session || !data.user) {
    return {
      ok: true,
      message:
        "Cuenta creada. Revisa tu email para confirmar y luego inicia sesión.",
    };
  }

  // 4) Con confirmación DESACTIVADA hay session → creamos/actualizamos el perfil
  const userId = data.user.id;

  const ensure = await upsertProfileWithUniqueUsername(
    supabase,
    userId,
    username,
    full_name
  );

  if (!ensure.ok) {
    // Si no pudimos crear el perfil, devolvemos el motivo (no redirigimos)
    return { ok: false, message: ensure.message };
  }

  // 5) Todo OK → redirección SSR (Navbar y páginas se rehidratan con la sesión)
  redirect("/feed");
}
