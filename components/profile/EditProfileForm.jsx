// components/profile/EditProfileForm.jsx
"use client";
import { useState, useActionState } from "react";

export default function EditProfileForm({ initial, action, onboarding = false }) {
  const [form, setForm] = useState({
    username: initial?.username || "",
    full_name: initial?.full_name || "",
    bio: initial?.bio || "",
    avatar_url: initial?.avatar_url || "", // para mostrar el actual si existe
  });
  const [preview, setPreview] = useState("");
  const [state, formAction] = useActionState(action, null);

  function setField(name, value) {
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Editar perfil</h1>

      {onboarding && (
        <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm">
          <b>🟡 Estás en el primer paso.</b> Para continuar al feed debes
          definir un <b>nombre de usuario</b> y subir un <b>avatar</b>. Cuando
          pulses <b>Guardar</b>, si ya están ambos, te llevaremos al feed.
        </div>
      )}

      <form
        action={formAction}
        className="space-y-4"
      >
        {/* bandera para onboarding sólo si aplica */}
        {onboarding && <input type="hidden" name="onboarding" value="1" />}

        <div>
          <label className="text-sm font-medium">Nombre de Usuario</label>
          <input
            name="username"
            value={form.username}
            onChange={(e) => setField("username", e.target.value)}
            pattern="^[a-zA-Z0-9_.]{3,20}$"
            title="3-20: letras, números, _ o ."
            className="w-full border p-2 rounded"
            placeholder="tu_usuario"
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Nombre completo</label>
          <input
            name="full_name"
            value={form.full_name}
            onChange={(e) => setField("full_name", e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Tu nombre"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Bio</label>
          <textarea
            name="bio"
            rows={4}
            value={form.bio}
            onChange={(e) => setField("bio", e.target.value)}
            className="w-full border p-2 rounded"
            placeholder="Cuéntanos algo sobre ti…"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Avatar</label>
          <input
            type="file"
            name="avatar"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={handleFile}
          />
          {/* preview local o avatar actual */}
          {(preview || form.avatar_url || '/profile_icon.png') && (
            <img
              src={preview || form.avatar_url || '/profile_icon.png'}
              alt="avatar"
              className="h-16 w-16 rounded-full object-cover"
            />
          )}
        </div>

        <button className="w-full rounded bg-black text-white py-2">
          Guardar
        </button>

        {/* Mensaje de la Server Action */}
        {state?.message && (
          <p className="text-sm mt-2">{state.message}</p>
        )}
      </form>
    </main>
  );
}
