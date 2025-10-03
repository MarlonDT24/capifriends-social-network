"use client";
import { useState, useActionState, useTransition, useEffect } from "react";
import { createComment } from "@/app/feed/post-action";

export default function CommentComposer({ postId, onCommentAdded }) {
  const [value, setValue] = useState("");
  const [state, action] = useActionState(createComment, null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // ✅ CAMBIO: Cuando el comentario se crea exitosamente, recargar lista
    if (!isPending && state && state.error === false) {
      setValue("");
      if (onCommentAdded) {
        onCommentAdded(); // Llamar función para recargar comentarios
      }
    }
  }, [isPending, state, onCommentAdded]);

  const submit = () => {
    const v = value.trim();
    if (!v) return;
    const fd = new FormData();
    fd.set("post_id", postId);
    fd.set("content", v);

    startTransition(() => action(fd));
  };

  return (
    <div className="flex gap-2">
      <input
        className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-secondary/50 transition-all"
        value={value}
        placeholder="Escribe un comentario…"
        onChange={(e) => setValue(e.target.value.slice(0, 500))}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <button
        type="button"
        onClick={submit}
        disabled={isPending || !value.trim()}
        className="rounded-lg px-4 py-2 text-sm text-white ocean-gradient disabled:opacity-50 hover:shadow-md transition-all"
      >
        {isPending ? "..." : "Comentar"}
      </button>
    </div>
  );
}