"use client";
import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import Link from "next/link";

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");

    //Se extraen los campos del formulario
    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const password = form.get("password");
    const full_name = form.get("full_name");

    //Se crea la cuenta en Supabase con la fución signUp
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    });

    //Desactiva el estado de carga.
    setLoading(false);
    //Muestra el mensaje de error o éxito.
    setMsg(
      error ? error.message : "Cuenta creada! Revisa tu email o inicia sesión."
    );
  }

  return (
    <main className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Crear cuenta</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input
          name="full_name"
          placeholder="Nombre completo"
          className="w-full border p-2 rounded"
        />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full border p-2 rounded"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Contraseña"
          className="w-full border p-2 rounded"
        />
        <button
          disabled={loading}
          className="w-full rounded bg-black text-white py-2"
        >
          {loading ? "Creando..." : "Registrarme"}
        </button>
      </form>
      <p className="text-sm">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="underline">
          Inicia sesión
        </Link>
      </p>
      {msg && <p className="text-sm text-muted-foreground">{msg}</p>}
    </main>
  );
}
