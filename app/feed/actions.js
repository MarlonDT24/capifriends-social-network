"use server";
/**
 * Server Action para crear posts.
 * Valida, usa la sesión del servidor (cookies) y respeta RLS.
 */
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function createPost(prev, formData) {
  const supabase = await createServerSupabase();

  // 1) Sesión obligatoria
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: true, message: "No autorizado." };

  // 2) Extrae campos
  const content = (formData.get("content") || "").toString().trim();
  const image_url = (formData.get("image_url") || "").toString().trim();

  if (content.length < 1) {
    return { error: true, message: "El contenido es obligatorio." };
  }

  // 3) Inserta (RLS: INSERT propio está permitido por las policies)
  const { error } = await supabase.from("posts").insert({
    author_id: session.user.id,
    content,
    image_url: image_url || null,
  });

  if (error) return { error: true, message: error.message };

  // 4) Revalida feed para ver el nuevo post
  revalidatePath("/feed");
  return { error: false, message: "¡Publicado!" };
}