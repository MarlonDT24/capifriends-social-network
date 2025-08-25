"use client";
import { useState } from "react";
import { supabase } from "@/app/lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const router = useRouter();
  const params = useSearchParams();
  const redirectedFrom = params.get("redirectedFrom") || "/feed";

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const password = form.get("password");

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) setMsg(error.message);
    else router.replace(redirectedFrom);
  }

  return (
    <main className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <input name="email" type="email" required placeholder="Email" className="w-full border p-2 rounded" />
        <input name="password" type="password" required placeholder="Password" className="w-full border p-2 rounded" />
        <button disabled={loading} className="w-full rounded bg-black text-white py-2">
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
      <p className="text-sm">
        ¿No tienes cuenta? <Link href="/signup" className="underline">Regístrate</Link>
      </p>
      {msg && <p className="text-sm text-red-600">{msg}</p>}
    </main>
  );
}