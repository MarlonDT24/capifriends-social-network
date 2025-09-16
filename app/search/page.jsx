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
                  alt=""
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
                  <AddFriendButton username={p.username} />
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