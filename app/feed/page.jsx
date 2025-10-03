import { createServerSupabase } from "@/lib/supabaseServer";
import { redirect } from "next/navigation"; // ← para redirigir desde el servidor;
import PostComposer from "@/components/feed/PostComposer"; // ← formulario para publicar
import PostCard from "@/components/feed/PostCard";
import CommentsPanel from "@/components/comments/CommentsPanel";

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
  const { data: posts, error: postsError } = await supabase
    .from("posts")
    // Se seleccionan los campos del post y del autor (relación)
    .select(
      `
      id, content, image_url, created_at,
      likes_count, comments_count, bookmarks_count,
      author:author_id ( id, username, full_name, avatar_url )
    `
    )
    .order("created_at", { ascending: false });

  if (postsError) {
    console.error(postsError);
    return null;
  }

  // 4.1) IDs de posts que el usuario actual ha "likeado"
  const { data: myLikes } = await supabase
    .from("post_likes")
    .select("post_id")
    .eq("user_id", session.user.id);

  const likedSet = new Set((myLikes || []).map((r) => r.post_id));

  // 4.2) IDs de posts que el usuario actual ha "guardado"
  const { data: myBookmarks } = await supabase
    .from("post_bookmarks")
    .select("post_id")
    .eq("user_id", session.user.id);

  const bookmarkedSet = new Set((myBookmarks || []).map((r) => r.post_id));

  // 5) Para cada post, obtener información de interacciones del usuario actual
  // (Por ahora simulamos los datos, luego conectaremos con las tablas reales)
  const postsWithInteractions =
    posts?.map((post) => ({
      ...post,
      user_liked: likedSet.has(post.id),
      user_bookmarked: bookmarkedSet.has(post.id),
    })) ?? [];

  return (
    <main className="mx-auto max-w-2xl p-6 space-y-3">
      {/* 5) Composer para crear un post (usa Server Action) */}
      <PostComposer me={{ user: { id: session.user.id }, profile }} />

      {/* 6) Listado simple de posts */}
      <section className="space-y-4">
        {postsWithInteractions.length === 0 ? (
          // Estado vacío
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/50 flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-muted-foreground"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
              </svg>
            </div>
            <h3 className="font-medium text-foreground mb-2">
              ¡Tu feed está vacío!
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sé el primero en compartir algo interesante
            </p>
          </div>
        ) : (
          // Lista de posts
          postsWithInteractions.map((post) => (
            <PostCard key={post.id} post={post} currentUserId={session.user.id}>
              <CommentsPanel postId={post.id} />
            </PostCard>
          ))
        )}
      </section>

      {/* Indicador de carga para futuros posts */}
      {postsWithInteractions.length > 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            Has llegado al final del feed
          </p>
        </div>
      )}
    </main>
  );
}
