// app/profile/edit/actions.js
"use server";

import { createServerSupabase } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateProfile(prevState, formData) {
  const supabase = await createServerSupabase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "No autorizado" };

  // Campos de texto
  const v = (k) => formData.get(k)?.toString().trim() ?? "";
  const username = v("username");
  const full_name = v("full_name");
  const bio = v("bio");
  const onboarding = ["1", "true", 1, true].includes(formData.get("onboarding"));

  // Merge seguro
  const updates = {};
  if (username) updates.username = username;
  if (full_name) updates.full_name = full_name;
  if (bio) updates.bio = bio;

  // Si el usuario adjuntó archivo, súbelo al bucket desde el servidor
  const maybeFile = formData.get("avatar");
  let newAvatarUrl = "";
  if (maybeFile && typeof maybeFile === "object" && "size" in maybeFile && maybeFile.size > 0) {
    const file = /** @type {File} */ (maybeFile);
    const safeName = file.name.replace(/\s+/g, "_");
    const path = `${user.id}/${Date.now()}_${safeName}`;

    const { error: upErr } = await supabase
      .storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (upErr) {
      return { ok: false, message: upErr.message }; // se mostrará bajo el botón
    }

    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    newAvatarUrl = pub.publicUrl;
  }

  // Si hay avatar nuevo, lo aplicamos; si no, no tocamos el existente
  if (newAvatarUrl) {
    updates.avatar_url = newAvatarUrl;
  }

  // Ejecuta UPDATE si hay algo que cambiar
  if (Object.keys(updates).length) {
    const { error: upErr } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", user.id);
    if (upErr) {
      if (upErr.code === "23505") return { ok: false, message: "Ese username ya existe." };
      return { ok: false, message: upErr.message };
    }
  }

  // Revalida la página por si permanecemos en ella
  revalidatePath("/profile/edit");

  // Onboarding -> redirige si ya hay username + avatar
  if (onboarding) {
    const { data: p, error: selErr } = await supabase
      .from("profiles")
      .select("username, avatar_url")
      .eq("id", user.id)
      .single();
    if (selErr) return { ok: false, message: selErr.message };

    if (p?.username && p?.avatar_url) {
      redirect("/feed");
    }
  }

  return { ok: true, message: "Perfil actualizado ✅" };
}
