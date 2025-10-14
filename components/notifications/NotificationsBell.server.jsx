// components/notifications/NotificationsBell.server.jsx
import { createServerSupabase } from "@/lib/supabaseServer";
import NotificationsDropdown from "./NotificationsDropdown";

// Muestra una campanita con el número de notificaciones pendientes (inbox).
// Calcula el contador de pendientes y delega el panel a un client component.

export default async function NotificationsBell() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  // Si no hay sesión, no mostramos la campanita
  if (!user) return null;

  // Contamos solicitudes pending donde yo soy el destinatario
  const { count } = await supabase
    .from("friendships")
    .select("id", { count: "exact", head: true })
    .eq("addressee_id", user.id)
    .eq("status", "pending");

  return <NotificationsDropdown initialCount={count || 0} />;
}