import { createServerSupabase } from "@/lib/supabaseServer";
import NavbarClient from "./NavbarClient";

export default async function Navbar() {
  const supabase = await createServerSupabase();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  let profile = null;
  let notificationsCount = 0;

  if (session?.user) {
    const { data } = await supabase
      .from("profiles")
      .select("username, full_name, avatar_url")
      .eq("id", session.user.id)
      .single();
    profile = data ?? null;

    // contador de solicitudes de amistad pendientes (para la "campanita")
    const { count } = await supabase
      .from("friendships")
      .select("id", { count: "exact", head: true })
      .eq("addressee_id", session.user.id)
      .eq("status", "pending");
    notificationsCount = count || 0;
  }
  return (
    <NavbarClient
      user={session?.user ?? null}
      profile={profile}
      notificationsCount={notificationsCount}
    />
  );
}
