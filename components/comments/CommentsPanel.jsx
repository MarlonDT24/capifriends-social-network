"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import CommentComposer from "./CommentComposer";

export default function CommentsPanel({ postId }) {
  const [comments, setComments] = useState([]);
  const [profilesById, setProfilesById] = useState(new Map());
  const [loading, setLoading] = useState(true);

  // Función para recargar comentarios
  const loadComments = useCallback(async () => {
    setLoading(true);
    
    const { data: rawComments, error: commentsError } = await supabase
      .from("post_comments")
      .select("id, content, created_at, user_id, post_id")
      .eq("post_id", postId)
      .order("created_at", { ascending: false })
      .limit(20);
  
    if (commentsError) {
      console.error("Error cargando comentarios:", commentsError);
      setLoading(false);
      return;
    }

    const commentsData = rawComments ?? [];
    setComments(commentsData);

    if (commentsData.length > 0) {
      const uniqueUserIds = [...new Set(commentsData.map(c => c.user_id))];
  
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .in("id", uniqueUserIds);
  
      if (!profilesError && profiles) {
        const profilesMap = new Map(profiles.map(p => [p.id, p]));
        setProfilesById(profilesMap);
      }
    }
    setLoading(false);
  }, [postId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return "ahora";
    if (diffInMinutes < 60) return `${diffInMinutes}min`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
  };

  if (loading) {
    return (
      <div className="mt-3 rounded-xl border border-border/60 bg-card/50 max-h-[300px] flex flex-col">
        <div className="p-3 border-b border-border/50">
          {/* ✅ CAMBIO: Pasar loadComments como prop */}
          <CommentComposer postId={postId} onCommentAdded={loadComments} />
        </div>
        <div className="p-3 space-y-3 animate-pulse">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-muted"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-20 bg-muted rounded"></div>
                <div className="h-3 w-full bg-muted/80 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-border/60 bg-card/50 max-h-[300px] flex flex-col">
      <div className="p-3 border-b border-border/50 flex-shrink-0">
        {/* ✅ CAMBIO: Pasar loadComments como prop */}
        <CommentComposer postId={postId} onCommentAdded={loadComments} />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {comments.length === 0 ? (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Sé el primero en comentar</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/50">
            {comments.map((c) => {
              const u = profilesById.get(c.user_id);
              const avatar = u?.avatar_url || "/profile_icon.png";
              const username = u?.username || "usuario";

              return (
                <li key={c.id} className="p-2.5 flex gap-2.5 hover:bg-muted/20 transition-colors">
                  <img
                    src={avatar}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover flex-shrink-0"
                    onError={(e) => { e.currentTarget.src = "/profile_icon.png"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-ocean-secondary">
                        @{username}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(c.created_at)}
                      </span>
                    </div>
                    <p className="text-sm text-foreground leading-snug whitespace-pre-wrap">
                      {c.content}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}