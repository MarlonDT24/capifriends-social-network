// app/api/notifications/inbox/route.js
import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/supabaseServer";

/**
 * Devuelve la “bandeja” de notificaciones que YA puedes construir con tu BD actual:
 * - Solicitudes de amistad pendientes donde el usuario logueado es el addressee.
 * Estructura de salida:
 *   {
 *     count: number,              // total pendientes
 *     items: [
 *       {
 *         id,                     // id de la fila en friendships (request)
 *         created_at,             // para mostrar "hace X"
 *         requester: { id, username, full_name, avatar_url }
 *       },
 *       ...
 *     ]
 *   }
 */
export async function GET() {
  const supabase = await createServerSupabase();

  // 1) Usuario actual
  const { data: authData, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authData?.user) {
    return NextResponse.json({ count: 0, items: [] }, { status: 200 });
  }
  const me = authData.user.id;

  // 2) Pide solicitudes pending dirigidas a mí
  const { data: reqs, error: reqErr } = await supabase
    .from("friendships")
    .select("id, requester_id, created_at")
    .eq("addressee_id", me)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (reqErr) {
    return NextResponse.json({ error: reqErr.message }, { status: 400 });
  }

  if (!reqs?.length) {
    return NextResponse.json({ count: 0, items: [] }, { status: 200 });
  }

  // 3) Cargamos los perfiles de los solicitantes para pintar avatar/username
  const requesterIds = reqs.map((r) => r.requester_id);
  const { data: profiles, error: profErr } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .in("id", requesterIds);

  if (profErr) {
    return NextResponse.json({ error: profErr.message }, { status: 400 });
  }

  const byId = new Map(profiles.map((p) => [p.id, p]));
  const items = reqs.map((r) => ({
    id: r.id,
    created_at: r.created_at,
    requester: byId.get(r.requester_id) ?? {
      id: r.requester_id,
      username: "usuario",
      full_name: "",
      avatar_url: "/profile_icon.png",
    },
  }));

  return NextResponse.json({ count: items.length, items }, { status: 200 });
}