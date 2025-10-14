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