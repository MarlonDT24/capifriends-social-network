import Link from "next/link";
import { createServerSupabase } from "@/lib/supabaseServer";
import AddFriendButton from "@/components/friends/AddFriendButton";

export default async function SearchPage({ searchParams }) {
  const qRaw = searchParams?.q ?? "";
  const q = decodeURIComponent(qRaw).trim();

  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let results = [];
  if (q) {
    // Busca por username o nombre completo (case-insensitive, parcial)
    const { data } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url")
      .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
      .order("username", { ascending: true })
      .limit(30);

    // No mostrarte a ti mismo
    results = (data ?? []).filter((p) => p.id !== user?.id);
  }

   // Mapa de relación
  const relMap = new Map();
  if (user && results.length > 0) {
    const ids = results.map((r) => r.id);
    //Solicitudes que YO envié
    const { data: outRows } = await supabase
    .from("friendships")
    .select("id, requester_id, addressee_id, status")
    .eq("requester_id", user.id)
    .in("addressee_id", ids);

    // solicitudes que YO recibí -> (in)
    const { data: inRows } = await supabase
      .from("friendships")
      .select("id, requester_id, addressee_id, status")
      .eq("addressee_id", user.id)
      .in("requester_id", ids);

    for (const r of [...(outRows ?? []), ...(inRows ?? [])]) {
      const role = r.requester_id === user.id ? "out" : "in";
      const otherId = role === "out" ? r.addressee_id : r.requester_id;
      relMap.set(otherId, { id: r.id, status: r.status, role });
    }
  }

  return (
    <main className="max-w-2xl mx-auto p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Resultados</h1>
        {q && (
          <p className="text-sm text-muted-foreground">
            Buscaste: <span className="font-medium">&quot;{q}&quot;</span>
          </p>
        )}
      </header>

      {!q ? (
        <p className="text-muted-foreground">
          Escribe un nombre o usuario en el buscador de arriba.
        </p>
      ) : results.length === 0 ? (
        <p className="text-muted-foreground">No hay usuarios que coincidan.</p>
      ) : (
        <ul className="space-y-3">
          {results.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-xl border p-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={p.avatar_url || "/profile_icon.png"}
                  alt="Icon user"
                  className="h-10 w-10 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <div className="font-medium truncate">
                    {p.full_name || p.username}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    @{p.username}
                  </div>
                </div>
              </div>

              <div className="shrink-0">
                {user ? (
                  // Botón para enviar solicitud de amistad directamente desde el buscador
                  <AddFriendButton addresseeId={p.id} username={p.username} relationship={relMap.get(p.id) || null} />
                ) : (
                  <Link href="/login" className="text-sm underline">
                    Inicia sesión
                  </Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}