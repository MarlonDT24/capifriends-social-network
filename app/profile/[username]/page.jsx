import { createServerSupabase } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileTabs from "@/components/profile/ProfileTabs";

export default async function ProfilePage({ params }) {
  const { username } = await params;
  const supabase = await createServerSupabase();

  //1. Obtenemos sesión del usuario autenticado
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const currentUserId = session?.user.id;

  //2. Buscamos el perfil del usuario por su username
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, username, full_name, bio, avatar_url")
    .eq("username", username)
    .single();
  // Si no existe el perfil, mostramos página 404
  if (profileError || !profile) {
    notFound();
  }

  const isOwnProfile = currentUserId === profile.id;

  //3. Obtenemos las estadísticas del perfil
  //3.1 Contamos los posts del usuario
  const { count: postsCount } = await supabase
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("author_id", profile.id);

  //3.2 Contamos los amigos del usuario
  const { count: friendsCount } = await supabase
    .from("friendships")
    .select("id", { count: "exact", head: true })
    .eq("status", "accepted")
    .or(`requester_id.eq.${profile.id},addressee_id.eq.${profile.id}`);

  //3.3 Si no es tu perfil, verificamos si ya son amigos
  let friendshipStatus = null;
  if (!isOwnProfile && currentUserId) {
    const { data: friendship } = await supabase
      .from("friendships")
      .select("id, status, requester_id, addressee_id")
      .or(
        `and(requester_id.eq.${currentUserId},addressee_id.eq.${profile.id}),and(requester_id.eq.${profile.id},addressee_id.eq.${currentUserId})`
      )
      .single();

    if (friendship) {
      friendshipStatus = {
        status: friendship.status,
        isSentByMe: friendship.requester_id === currentUserId,
      };
    }
  }

  //4. Obtenemos los posts del usuario
  const { data: userPosts } = await supabase
    .from("posts")
    .select(
      `
      id, content, image_url, created_at,
      likes_count, comments_count,
      author:author_id ( id, username, full_name, avatar_url )
    `
    )
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(20);

  //5. Obtenemos los posts guardados
  let savedPosts = [];
  if (isOwnProfile) {
    const { data: bookmarks } = await supabase
      .from("post_bookmarks")
      .select(
        `
        post_id,
        posts:post_id (
          id, content, image_url, created_at,
          likes_count, comments_count,
          author:author_id ( id, username, full_name, avatar_url )
        )
      `
      )
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(20);

    savedPosts = bookmarks?.map((b) => b.posts).filter(Boolean) || [];
  }

  //6. Obtener amigos del usuario
  const { data: friendshipsData } = await supabase
    .from("friendships")
    .select(`
      id,
      requester:requester_id ( id, username, full_name, avatar_url ),
      addressee:addressee_id ( id, username, full_name, avatar_url )
    `)
    .eq("status", "accepted")
    .or(`requester_id.eq.${profile.id},addressee_id.eq.${profile.id}`)
    .limit(50);

  //Mapear amigos (excluir el perfil actual)
  const friends = friendshipsData?.map(f => {
    return f.requester.id === profile.id ? f.addressee : f.requester;
  }) || [];

  //7. Si es tu perfil, obtener info de likes del usuario para los posts
  let userLikes = new Set();
  let userBookmarks = new Set();
  if (currentUserId) {
    const { data: likes } = await supabase
      .from("post_likes")
      .select("post_id")
      .eq("user_id", currentUserId);
    userLikes = new Set(likes?.map(l => l.post_id) || []);

    const { data: bookmarks } = await supabase
      .from("post_bookmarks")
      .select("post_id")
      .eq("user_id", currentUserId);
    userBookmarks = new Set(bookmarks?.map(b => b.post_id) || []);
  }

  //Enriquecer posts con info de likes/bookmarks del usuario actual
  const enrichedPosts = userPosts?.map(post => ({
    ...post,
    user_liked: userLikes.has(post.id),
    user_bookmarked: userBookmarks.has(post.id),
  })) || [];

  const enrichedSavedPosts = savedPosts.map(post => ({
    ...post,
    user_liked: userLikes.has(post.id),
    user_bookmarked: true, // Ya están guardados
  }));

  return (
    <main className="mx-auto max-w-4xl p-6 space-y-6">
        {/* Header del perfil */}
        <ProfileHeader 
            profile={profile}
            stats={{ postsCount: postsCount || 0, friendsCount: friendsCount || 0 }}
            isOwnProfile={isOwnProfile}
            friendshipStatus={friendshipStatus}
        />

        {/* Tabs del perfil */}
        <ProfileTabs
            isOwnProfile={isOwnProfile}
            currentUserId={currentUserId}
            posts={enrichedPosts}
            savedPosts={enrichedSavedPosts}
            friends={friends}
        />
    </main>
  );
  
}
