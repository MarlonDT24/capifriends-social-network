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

  const MAX = 500; //límite duro de caracteres

  // CHANGED: control de visibilidad/animación del éxito del bloque inferior
  const [successVisible, setSuccessVisible] = useState(false); // CHANGED
  const [successFading, setSuccessFading] = useState(false);   // CHANGED

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
    el.style.height = Math.min(el.scrollHeight, 160) + "px"; // máx 160px
  }, [content]);

  // CHANGED: manejar éxito -> limpiar campos + mostrar banner 3s con fade-out
  useEffect(() => {
    if (!state) return;
    if (state.error === false) {
      setContent("");                 // CHANGED
      setImageUrl("");                // CHANGED
      setSuccessVisible(true);        // CHANGED (monta el banner)
      setSuccessFading(false);        // CHANGED (aparece opaco)
      const t1 = setTimeout(() => setSuccessFading(true), 2500); // CHANGED (empieza a desvanecer a los 2.5s)
      const t2 = setTimeout(() => setSuccessVisible(false), 3000); // CHANGED (desmonta a los 3s)
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [state]); // CHANGED

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
      }}
      className="rounded-3xl border-2 border-zinc-800/60 bg-zinc-900/60 backdrop-blur-sm shadow-lg hover:shadow-xl smooth-transition relative overflow-hidden"
    >
      {/* Cabecera */}
      <div className="px-4 pt-4 relative z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={me?.profile?.avatar_url || "/profile_icon.png"}
              onError={(e) => { e.currentTarget.src = "/profile_icon.png"; }}
              alt={me?.profile?.username ? `Avatar de @${me.profile.username}` : "Tu avatar"}
              className="h-14 w-14 rounded-full object-cover shrink-0 ring-4 ring-ocean-light/30 hover:ring-ocean-accent/50 smooth-transition hover:scale-105"
            />
          </div>
          <div className="flex-1">
            <textarea
              ref={taRef}
              name="content"
              value={content}
              onChange={(e) => {
                const v = e.target.value;
                setContent(v.length <= MAX ? v : v.slice(0, MAX));
              }}
              rows={3}
              placeholder="¿Qué momento quieres compartir hoy?"
              className="w-full resize-none bg-transparent focus:outline-none text-sm placeholder:text-muted-foreground/80 font-medium leading-relaxed"
              required
              maxLength={MAX}
            />
          </div>
        </div>
      </div>

      {/* Previsualización de imagen */}
      {imageUrl && (
        <div className="px-6 mt-4 relative z-10">
          <div className="relative rounded-2xl overflow-hidden ">
            <img src={imageUrl} alt="previsualización" className="w-full max-h-96 object-cover" />
            <button
              type="button"
              onClick={() => setImageUrl("")}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black/90 smooth-transition backdrop-blur-sm"
              aria-label="Quitar imagen"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Barra de acciones */}
      <div className="px-6 py-4 flex items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3">
          {/* Botón imagen rediseñado */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-full border-2 border-ocean-light px-4 py-2 text-sm font-medium bg-white/60 hover:bg-white/80 text-ocean-primary hover:border-ocean-secondary smooth-transition disabled:opacity-50 backdrop-blur-sm"
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            {uploading ? "Subiendo..." : "Imagen"}
          </button>
          
          {/* Input oculto */}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickImage}
          />

          {/* Contador de caracteres */}
          <div className="text-sm text-muted-foreground/60 font-medium">
            {content.length > 0 && (
              <span className={content.length > 500 ? "text-red-500" : "text-ocean-secondary"}>
                {content.length}/500
              </span>
            )}
          </div>
        </div>

        {/* Botón publicar */}
        <button
          disabled={!content.trim() || uploading || content.length > 500}
          className="ocean-gradient rounded-full px-6 py-2.5 text-white text-sm font-semibold hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:transform-none smooth-transition relative overflow-hidden"
        >
          <span className="relative z-10">
            {uploading ? "Publicando..." : "Compartir"}
          </span>
          {/* Efecto de brillo en el botón */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-600 ease-out"></div>
        </button>
      </div>

      {/* Mensajes bajo la tarjeta */}
      {(localMsg || state?.message) && (
        // CHANGED: wrapper con role y aria-live para accesibilidad
        <div className="mt-3" role="status" aria-live="polite"> {/* CHANGED */}
          {/* CHANGED: si es éxito -> animación fade-out y desmontaje a los 3s */}
          {!state?.error && state?.message && successVisible ? ( /* CHANGED */
            <div
              className={`p-3 rounded-lg text-sm bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-900/50 transition-opacity duration-500 ${
                successFading ? "opacity-0" : "opacity-100"
              }`} /* CHANGED */
            >
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
                {state.message}
              </div>
            </div>
          ) : null}

          {/* CHANGED: errores o avisos locales se muestran normal, sin auto-cerrar */}
          {(state?.error || localMsg) ? ( /* CHANGED */
            <div
              className={`p-3 rounded-lg text-sm ${
                state?.error || localMsg.includes("Error")
                  ? "bg-red-950/50 text-red-300 ring-1 ring-red-900/60"
                  : "bg-amber-950/40 text-amber-300 ring-1 ring-amber-900/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                {localMsg || state?.message}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </form>
  );
}
