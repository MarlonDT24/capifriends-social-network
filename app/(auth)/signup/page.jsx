"use client";
import { useActionState, useState, useMemo } from "react";
import Link from "next/link";
import { signupAction } from "../actions";

/**
 * Reglas de validación locales (cliente)
 */
function validateFields({ full_name, username, email, password }) {
  const errors = {};

  // full_name -> opcional (ajusta si lo quieres obligatorio)
  if (full_name && full_name.trim().length > 80) {
    errors.full_name = "El nombre es demasiado largo.";
  }

  // username obligatorio: 3–20, letras/números/._ (sin espacios)
  if (!username || !username.trim()) {
    errors.username = "El nombre de usuario es obligatorio.";
  } else if (!/^[a-zA-Z0-9_.]{3,20}$/.test(username)) {
    errors.username = "Usa 3–20 caracteres: letras, números, _ o .";
  }

  // email obligatorio (regex simple)
  if (!email || !email.trim()) {
    errors.email = "El email es obligatorio.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "El formato de email no es válido.";
  }

  // password obligatoria, mínimo 6 (ajusta si quieres 8+)
  if (!password) {
    errors.password = "La contraseña es obligatoria.";
  } else if (password.length < 6) {
    errors.password = "Mínimo 6 caracteres.";
  }

  return { errors, isValid: Object.keys(errors).length === 0 };
}

export default function SignupPage() {
  // Estado de campos (controlados)
  const [full_name, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Para mostrar errores cuando el usuario intenta enviar
  const [showAllErrors, setShowAllErrors] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Vincula el <form> con la Server Action; `state` recibe {ok, message} si no hubo redirect
  const [state, formAction] = useActionState(signupAction, null);

  // Validación reactiva
  const { errors, isValid } = useMemo(
    () => validateFields({ full_name, username, email, password }),
    [full_name, username, email, password]
  );

  // Intento de enviar: si no es válido, muestro todos los errores y no envío
  async function doSubmit(formData) {
    if (!isValid) {
      setShowAllErrors(true);
      return;
    }
    setShowAllErrors(false);
    setSubmitting(true);
    await formAction(formData); // ejecuta la Server Action
    setSubmitting(false);
  }

  // Ayudante para decidir si mostramos el error de un campo
  const show = (field) => showAllErrors && errors[field];

  // Mapeo de posibles mensajes del servidor a campos (opcional)
  const serverEmailTaken =
    state?.ok === false &&
    typeof state.message === "string" &&
    /email|registered|existe|exists|duplicate/i.test(state.message);

  return (
    <main className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Crear cuenta</h1>

      {/* Importante: usamos `action` para poder preparar el envío manualmente */}
      <form
        action={async (formData) => {
          // El formData ya trae los values de los inputs (controlados)
          await doSubmit(formData);
        }}
        className="space-y-3"
        noValidate
      >
        {/* Nombre completo (opcional) */}
        <div>
          <input
            name="full_name"
            placeholder="Nombre completo"
            className="w-full border p-2 rounded"
            value={full_name}
            onChange={(e) => setFullName(e.target.value)}
            aria-invalid={!!show("full_name")}
            aria-describedby={show("full_name") ? "err_full_name" : undefined}
          />
          {show("full_name") && (
            <p id="err_full_name" className="mt-1 text-xs text-red-600">
              {errors.full_name}
            </p>
          )}
        </div>

        {/* Username obligatorio */}
        <div>
          <input
            name="username"
            placeholder="Nombre de usuario (3–20, letras/números/_. )"
            className="w-full border p-2 rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            aria-invalid={!!show("username")}
            aria-describedby={show("username") ? "err_username" : undefined}
          />
          {show("username") && (
            <p id="err_username" className="mt-1 text-xs text-red-600">
              {errors.username}
            </p>
          )}
        </div>

        {/* Email obligatorio */}
        <div>
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full border p-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!(show("email") || serverEmailTaken)}
            aria-describedby={
              show("email") || serverEmailTaken ? "err_email" : undefined
            }
          />
          {(show("email") || serverEmailTaken) && (
            <p id="err_email" className="mt-1 text-xs text-red-600">
              {serverEmailTaken
                ? "Ese email ya está registrado."
                : errors.email}
            </p>
          )}
        </div>

        {/* Password obligatoria */}
        <div>
          <input
            name="password"
            type="password"
            placeholder="Contraseña"
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!show("password")}
            aria-describedby={show("password") ? "err_password" : undefined}
          />
          {show("password") && (
            <p id="err_password" className="mt-1 text-xs text-red-600">
              {errors.password}
            </p>
          )}
        </div>

        <button
          className="w-full rounded bg-black text-white py-2 disabled:opacity-50"
          disabled={!isValid || submitting}
        >
          {submitting ? "Creando..." : "Registrarme"}
        </button>
      </form>

      <p className="text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="underline">
          Inicia sesión
        </Link>
      </p>

      {/* Mensaje global del servidor cuando no hay redirect */}
      {state?.message && !serverEmailTaken && (
        <p className={`text-sm ${state.ok ? "" : "text-red-600"}`}>
          {state.message}
        </p>
      )}
    </main>
  );
}
