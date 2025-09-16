"use client";
/**
 * Composer visual para crear posts:
 * - Textarea autoajustable
 * - Botón "foto" que abre el file input oculto
 * - Previsualización con botón para quitar
 * - Llama a la Server Action createPost
 */
import { useRef, useState, useActionState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { createPost } from "@/app/feed/actions";

export default function PostComposer({ me: meProp }) {
  const [me, setMe] = useState(meProp || null);
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [localMsg, setLocalMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [state, formAction] = useActionState(createPost, null);
  const fileRef = useRef(null);
  const taRef = useRef(null);

  // Si no viene el perfil desde el server, lo cargo en el cliente
  useEffect(() => {
    if (meProp) return;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, username, full_name, avatar_url")
        .eq("id", user.id)
        .single();
      setMe({ user, profile });
    })();
  }, [meProp]);

  // Auto-resize del textarea
  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = Math.min(el.scrollHeight, 240) + "px"; // máx 240px
  }, [content]);

  async function onPickImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLocalMsg("");

    const okTypes = ["image/png", "image/jpeg", "image/webp", "image/gif"];
    if (!okTypes.includes(file.type)) {
      setLocalMsg("Formato no soportado. Usa PNG/JPG/WEBP/GIF.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setLocalMsg("Máximo 5MB.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLocalMsg("Sesión no encontrada. Inicia sesión de nuevo.");
      return;
    }

    setUploading(true);
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from("post-images").upload(path, file, { upsert: true });
    if (error) {
      setUploading(false);
      setLocalMsg(error.message);
      return;
    }
    const { data: pub } = supabase.storage.from("post-images").getPublicUrl(path);
    setImageUrl(pub.publicUrl);
    setUploading(false);
  }

  return (
    <form
      action={async (formData) => {
        setLocalMsg("");
        if (imageUrl) formData.set("image_url", imageUrl);
        await formAction(formData);
        if (!state?.error) {
          setContent("");
          setImageUrl("");
        }
      }}
      className="rounded-xl border bg-card text-card-foreground shadow-sm"
    >
      {/* Cabecera */}
      <div className="px-4 pt-4">
        <div className="flex items-center gap-3">
          <img
            src={me?.profile?.avatar_url || "/profile_icon.png"}
            onError={(e) => { e.currentTarget.src = "/profile_icon.png"; }}
            alt={me?.profile?.username ? `Avatar de @${me.profile.username}` : "Tu avatar"}
            className="h-10 w-10 rounded-full object-cover shrink-0"
          />
          <div className="flex-1">
            <textarea
              ref={taRef}
              name="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={1}
              placeholder="¿Qué estás pensando?"
              className="w-full resize-none bg-transparent focus:outline-none text-sm sm:text-base placeholder:text-muted-foreground/70"
              required
            />
          </div>
        </div>
      </div>

      {/* Previsualización de imagen */}
      {imageUrl && (
        <div className="px-4 mt-3">
          <div className="relative">
            <img src={imageUrl} alt="previsualización" className="w-full max-h-[420px] object-cover rounded-lg" />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="absolute top-2 right-2 rounded-full bg-black/60 text-white text-xs px-2 py-1"
              aria-label="Quitar imagen"
            >
              Quitar
            </button>
          </div>
        </div>
      )}

      {/* Barra de acciones */}
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Botón galería → dispara el file input oculto */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm bg-background hover:bg-accent"
          >
            {/* pequeño icono de imagen en SVG para evitar dependencias */}
            <svg width="16" height="16" viewBox="0 0 24 24" className="opacity-80" aria-hidden>
              <path fill="currentColor" d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14h18Zm-18 2h18a2 2 0 0 0 2-2V5a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v14a2 2 0 0 0 2 2Zm4-10l3 4l2-3l4 5H5l2-6Z"/>
            </svg>
            {uploading ? "Subiendo..." : "Foto"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickImage}
          />
        </div>

        <button
          disabled={!content.trim() || uploading}
          className="rounded-md bg-blue-600 px-4 py-1.5 text-white text-sm font-medium hover:opacity-90 disabled:opacity-50"
        >
          Publicar
        </button>
      </div>

      {/* Mensajes bajo la tarjeta */}
      {(localMsg || state?.message) && (
        <div className="px-4 pb-3 text-sm">
          <p className={state?.error ? "text-red-600" : "text-muted-foreground"}>
            {localMsg || state?.message}
          </p>
        </div>
      )}
    </form>
  );
}
