import { createServerSupabase } from "@/lib/supabaseServer";
import { redirect } from "next/navigation"; // ← para redirigir desde el servidor;
import PostComposer from "@/components/feed/PostComposer"; // ← formulario para publicar
import SignOutButton from "@/components/SignOutButton";

export default async function FeedPage() {
  // 1) Cliente SSR (lee cookies).
  const supabase = await createServerSupabase();

  // 2) Sesión actual; si NO hay sesión, redirige a /login (capa extra al middleware)
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    redirect("/login?redirectedFrom=/feed");
  }

  // 3) Perfil del usuario
  const { data: profile } = await supabase
    .from("profiles")
    .select("username, full_name, avatar_url")
    .eq("id", session.user.id)
    .single();


  // 4) Consulta real del feed (join al autor gracias al FK author_id → profiles.id)
  const { data: posts } = await supabase
    .from("posts")
    .select(
      `
      id, content, image_url, created_at,
      author:author_id ( id, username, full_name, avatar_url )
    `
    )
    .order("created_at", { ascending: false });

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Feed</h1>
      <p className="text-sm text-muted-foreground">
        Hola {profile?.full_name || profile?.username || "Caprifriends"}!
        Bienvenido a tu feed.
      </p>

      {/* 5) Composer para crear un post (usa Server Action) */}
      <PostComposer />

      {/* 6) Listado simple de posts */}
      <section className="space-y-4">
        {(posts ?? []).map((p) => (
          <article key={p.id} className="border rounded-xl p-4">
            <header className="flex items-center gap-3 mb-2">
              <img
                src={p.author?.avatar_url || "/profile_icon.png"}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <div className="font-medium">
                  {p.author?.full_name || p.author?.username || "Capifriend"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(p.created_at).toLocaleString()}
                </div>
              </div>
            </header>

            <p className="whitespace-pre-wrap text-sm">{p.content}</p>

            {p.image_url && (
              <img
                src={p.image_url}
                alt="post"
                className="mt-3 rounded-lg max-h-96 object-cover w-full"
              />
            )}
          </article>
        ))}
      </section>
    </main>
  );
}
