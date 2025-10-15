"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseAction } from "@/lib/supabaseServer";

export async function signOut() {
  const supabase = await createServerSupabaseAction();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error during signOut:", error);
    return { error: "Error al cerrar sesión" };
  }

  // Revalida rutas/layouts donde aparece la sesión
  revalidatePath("/", "layout");
  revalidatePath("/feed");
  revalidatePath("/profile/edit");

  // Redirige a Home ya sin cookies de sesión
  redirect("/");
}

export async function loginAction(prevState, formData) {
  const supabase = await createServerSupabaseAction();
  const email = formData.get("email")?.toString().trim().toLowerCase() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const redirectTo = formData.get("redirectedFrom")?.toString() ?? "/feed";

  if (!email || !password) {
    return { ok: false, error: "Email y password son obligatorios" };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  // Revalidar para que Navbar se actualice con la sesión
  revalidatePath("/", "layout");

  // Redirigir al destino
  redirect(redirectTo);
}

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
  const supabase = await createServerSupabaseAction();

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
