"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabase } from "@/lib/supabaseServer";

export async function signOut() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();

  // Revalida rutas/layouts donde aparece la sesión
  revalidatePath("/", "layout");
  revalidatePath("/feed");
  revalidatePath("/profile/edit");

  // Redirige a Home ya sin cookies de sesión
  redirect("/");
}