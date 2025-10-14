"use client";
import { useState, useActionState, useTransition } from "react";
import Link from "next/link";
import { toggleLike, toggleBookmark } from "@/app/feed/post-action";

export default function PostCard({ post, currentUserId, children }) {
  const [isLiked, setIsLiked] = useState(post.user_liked || false);
  const [likeCount, setLikeCount] = useState(post.likes_count || 0);
  const [isBookmarked, setIsBookmarked] = useState(
    post.user_bookmarked || false
  );
  const [showComments, setShowComments] = useState(false);

  // Server Actions
  const [likeState, likeAction] = useActionState(toggleLike, null);
  const [bookmarkState, bookmarkAction] = useActionState(toggleBookmark, null);
  const [isPendingLike, startLikeTransition] = useTransition();
  const [isPendingBm, startBmTransition] = useTransition();

  const author = post.author;
  const displayName = author?.full_name || author?.username || "Capifriend";
  const username = author?.username;

  // Formatear fecha de forma más amigable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Hace unos minutos";
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    if (diffInHours < 48) return "Ayer";
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "short",
    });
  };

  // Manejar like con optimistic update
  const handleLike = async () => {
    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

    // Server action
    const formData = new FormData();
    formData.set("post_id", post.id.toString());
    startLikeTransition(() => {
      likeAction(formData);
    });
  };

  // Manejar bookmark con optimistic update
  const handleBookmark = async () => {
    setIsBookmarked(!isBookmarked);

    const formData = new FormData();
    formData.set("post_id", post.id.toString());
    startBmTransition(() => {
      bookmarkAction(formData);
    });
  };

  return (
    <article className="bg-card/60 backdrop-blur-sm rounded-2xl border border-border/50 shadow-sm hover:shadow-md smooth-transition overflow-hidden">
      {/* Header del post */}
      <div className="p-5">
        <div className="flex items-start gap-3 mb-4">
          {/* Avatar con link al perfil */}
          <Link
            href={username ? `/profile/${username}` : "#"}
            className="flex-shrink-0"
          >
            <img
              src={author?.avatar_url || "/profile_icon.png"}
              alt={displayName}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-ocean-light/20 hover:ring-ocean-accent/40 smooth-transition hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "/profile_icon.png";
              }}
            />
          </Link>

          <div className="flex-1 min-w-0">
            {/* Nombre y username con link al perfil */}
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                href={username ? `/profile/${username}` : "#"}
                className="font-semibold text-foreground hover:text-ocean-secondary smooth-transition"
              >
                {displayName}
              </Link>
              {username && (
                <Link
                  href={`/profile/${username}`}
                  className="text-sm text-ocean-secondary hover:text-ocean-primary smooth-transition"
                >
                  @{username}
                </Link>
              )}
            </div>

            {/* Timestamp */}
            <time className="text-sm text-muted-foreground">
              {formatDate(post.created_at)}
            </time>
          </div>

          {/* Botón de opciones */}
          <button className="p-2 rounded-full hover:bg-muted/50 smooth-transition opacity-60 hover:opacity-100">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
        </div>

        {/* Contenido del post */}
        <div className="mb-4">
          <p className="text-foreground leading-relaxed whitespace-pre-wrap">
            {post.content}
          </p>
        </div>

        {/* Imagen si existe */}
        {post.image_url && (
          <div className="mb-4 rounded-xl overflow-hidden">
            <img
              src={post.image_url}
              alt="Imagen del post"
              className="w-full max-h-96 object-cover hover:scale-105 smooth-transition cursor-pointer"
              onClick={() => {
                // TODO: Abrir modal de imagen
                window.open(post.image_url, "_blank");
              }}
            />
          </div>
        )}

        {/* Barra de interacciones */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-1">
            {/* Botón Like */}
            <button
              onClick={handleLike}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-full smooth-transition ${
                isLiked
                  ? "text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50"
                  : "text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
              }`}
              disabled={isPendingLike}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill={isLiked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="smooth-transition group-hover:scale-110"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {likeCount > 0 && (
                <span className="text-sm font-medium">{likeCount}</span>
              )}
            </button>

            {/* Botón Comentar */}
            {/* <button className="group flex items-center gap-2 px-3 py-1.5 rounded-full text-muted-foreground hover:text-ocean-secondary hover:bg-ocean-light/20 smooth-transition"> */}
            <button
              onClick={() => setShowComments((v) => !v)}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full text-muted-foreground hover:text-ocean-secondary hover:bg-ocean-light/20 smooth-transition"
              aria-expanded={showComments}
              aria-controls={`comments-${post.id}`}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="smooth-transition group-hover:scale-110"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z" />
              </svg>
              {post.comments_count > 0 && (
                <span className="text-sm font-medium">
                  {post.comments_count}
                </span>
              )}
            </button>

            {/* Botón Compartir */}
            <button className="group flex items-center gap-2 px-3 py-1.5 rounded-full text-muted-foreground hover:text-nature-secondary hover:bg-nature-light/20 smooth-transition">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="smooth-transition group-hover:scale-110"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
          </div>

          {/* Botón Bookmark */}
          <button
            onClick={handleBookmark}
            className={`group p-1.5 rounded-full smooth-transition ${
              isBookmarked
                ? "text-ocean-secondary bg-ocean-light/20"
                : "text-muted-foreground hover:text-ocean-secondary hover:bg-ocean-light/20"
            }`}
            disabled={isPendingBm}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill={isBookmarked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="smooth-transition group-hover:scale-110"
            >
              <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16l7-3 7 3z" />
            </svg>
          </button>
        </div>
      </div>
      {showComments && (
        <div id={`comments-${post.id}`} className="px-5 pb-5">
          {children}
        </div>
      )}
    </article>
  );
}
