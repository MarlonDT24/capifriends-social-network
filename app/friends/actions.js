"use server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabaseServer";
/**
 * Acción para enviar una solicitud de amistad (INSERT en public.friendships).
 *
 * Requisitos previos en BD:
 * - Tabla public.friendships con columnas: id, requester_id, addressee_id, status (DEFAULT 'pending'), created_at.
 * - FKs: requester_id y addressee_id -> auth.users(id) (ya lo hiciste).
 * - RLS INSERT (WITH CHECK): auth.uid() = requester_id AND requester_id <> addressee_id
 *   y status = 'pending' o con default 'pending' en la columna.
 *
 * Esta acción acepta:
 *   - addressee_id (uuid), o
 *   - username (para resolver el id mirando public.profiles)
 */

export async function sendFriendRequest( prevState, formData ) {
  // 1) Supabase SSR usando cookies de la request actual
  const supabase = await createServerSupabase();

  // 2) Leemos al usuario actual (necesario para requester_id y validaciones)+
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authData?.user) {
    return {
      ok: false,
      message: "Debes iniciar sesión para enviar solicitudes.",
    };
  }
  const me = authData.user.id;

  // 3) Resolver destinatario: preferimos addressee_id; si no viene, aceptamos username
  let addresseeId = formData.get("addressee_id")?.toString() || "";

  if (!addresseeId) {
    const usernameRaw = formData.get("username")?.toString() || "";
    const username = usernameRaw.trim().toLowerCase();
    if (!username) {
      return { ok: false, message: "Falta el destinatario (id o username)." };
    }

    // Buscamos el perfil para obtener su id (en profiles.id == auth.users.id)
    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("id, username")
      .eq("username", username)
      .single();

    if (profErr || !profile) {
      return { ok: false, message: "No se encontró un usuario con ese nombre." };
    }
    addresseeId = profile.id;
  }

  // 4) Autoprotección: no puedes enviarte a ti mismo
  if (addresseeId === me) {
    return { ok: false, message: "No puedes enviarte una solicitud a ti mismo." };
  }

  // 5) Miramos si ya existe una relación entre ambos (en cualquier dirección).
  // RLS SELECT te dejará ver filas donde tú seas requester o addressee, que es justo el caso.
  const { data: existing, error: selErr } = await supabase
    .from("friendships")
    .select("id, status, requester_id, addressee_id")
    .or(
      `and(requester_id.eq.${me},addressee_id.eq.${addresseeId}),` +
      `and(requester_id.eq.${addresseeId},addressee_id.eq.${me})`
    )
    .maybeSingle();

  if (selErr) {
    return { ok: false, message: selErr.message };
  }

  if (existing) {
    // Damos mensajes útiles según el caso existente
    if (existing.status === "accepted") {
      return { ok: false, message: "Ya sois amigos." };
    }
    if (existing.status === "pending") {
      if (existing.requester_id === me) {
        return { ok: false, message: "Ya enviaste una solicitud. Está pendiente." };
      } else {
        return {
          ok: false,
          message: "Esa persona ya te envió una solicitud. Revísala en Notificaciones.",
        };
      }
    }
    if (existing.status === "declined") {
      return {
        ok: false,
        message:
          "La última solicitud fue rechazada. Podrás volver a intentarlo más adelante.",
      };
    }
  }

  // 6) Insertamos la solicitud. Ideal: tener DEFAULT 'pending' en la columna status.
  const { error: insErr } = await supabase.from("friendships").insert({
    requester_id: me,
    addressee_id: addresseeId,
  });

   if (insErr) {
    // 23505 = unique_violation (ya existe la pareja por índice LEAST/GREATEST)
    if (insErr.code === "23505") {
      return { ok: false, message: "Ya existe una relación con esta persona." };
    }
    // 23503 = foreign_key_violation (el destinatario no existe)
    if (insErr.code === "23503") {
      return { ok: false, message: "El usuario destinatario no existe." };
    }
    return { ok: false, message: insErr.message };
  }

  // 7) Revalida páginas relevantes (lista de solicitudes, etc.)
  revalidatePath("/friends"); // ajusta a tu ruta
  revalidatePath("/notifications");
  return { ok: true, message: "Solicitud enviada ✅" };
}

/**
 * UPDATE: aceptar solicitud (por id de la fila en friendships)
 * Usada por el dropdown de notificaciones.
 */

export async function acceptFriendRequestAction(requestId) {
  const supabase = await createServerSupabase();
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authData?.user) return { ok: false, message: "No autenticado." };

  const me = authData.user.id;

  const { error } = await supabase
    .from("friendships")
    .update({ status: "accepted" })
    .eq("id", requestId)
    .eq("addressee_id", me); // importante para que solo acepte el destinatario

  if (error) return { ok: false, message: error.message };

  revalidatePath("/friends");
  revalidatePath("/"); // navbar / dropdown
  return { ok: true };
}

/**
 * UPDATE: rechazar solicitud (por id de la fila)
 */
export async function declineFriendRequestAction(requestId) {
  const supabase = await createServerSupabase();
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authData?.user) return { ok: false, message: "No autenticado." };

  const me = authData.user.id;

  const { error } = await supabase
    .from("friendships")
    .update({ status: "declined" })
    .eq("id", requestId)
    .eq("addressee_id", me);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/friends");
  revalidatePath("/");
  return { ok: true };
}

// --- Wrappers para usar en <form action={...}> desde el cliente ---
export async function acceptFriendRequestForm(arg1, arg2) {
  const fd = arg2 instanceof FormData ? arg2 : arg1;
  const id = fd?.get("requestId")?.toString() ?? "";
  if (!id) return { ok: false, message: "Falta requestId" };
  return acceptFriendRequestAction(id);
}

export async function declineFriendRequestForm(arg1, arg2) {
  const fd = arg2 instanceof FormData ? arg2 : arg1;
  const id = fd?.get("requestId")?.toString() ?? "";
  if (!id) return { ok: false, message: "Falta requestId" };
  return declineFriendRequestAction(id);
}