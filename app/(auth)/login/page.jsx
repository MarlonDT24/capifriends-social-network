"use client";
import { useActionState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction } from "../actions";

function LoginForm() {
  const params = useSearchParams();
  const redirectedFrom = params.get("redirectedFrom") || "/feed";

  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <main className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>

      <form action={formAction} className="space-y-3">
         {/* Hidden input para pasar el redirect */}
        <input type="hidden" name="redirectedFrom" value={redirectedFrom} />
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full border p-2 rounded"
          autoComplete="email"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password"
          className="w-full border p-2 rounded"
          autoComplete="current-password"
        />
        <button
          disabled={isPending}
          className="w-full rounded bg-black text-white py-2 disabled:opacity-50" 
        >
          {isPending ? "Entrando..." : "Entrar"}
        </button>
      </form>

      <p className="text-sm">
        ¿No tienes cuenta?{" "}
        <Link href="/signup" className="underline">
          Regístrate
        </Link>
      </p>

      {state?.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
