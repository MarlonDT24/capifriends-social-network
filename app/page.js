import Link from "next/link";

export default function Home() {
  return (
    <div className="px-6 py-6">
      {/* HERO */}
      <section className="text-center py-16">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Bienvenido a <span className="text-brand">Capifriends</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Conecta con amigos, comparte momentos y descubre comunidades.
        </p>

        <div className="mt-8 flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="rounded-md bg-blue-600 px-5 py-2.5 text-white font-medium shadow hover:opacity-90"
          >
            Crear cuenta
          </Link>
          <Link
            href="/login"
            className="rounded-md bg-gray-900 px-5 py-2.5 text-white font-medium hover:opacity-90"
          >
            Iniciar sesión
          </Link>
        </div>
      </section>

      {/* PREVIEW DEL FEED (skeleton de tarjetas) */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {[1,2,3,4,5,6].map((i) => (
          <article key={i} className="border rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div>
                <div className="h-4 w-32 bg-gray-200 rounded" />
                <div className="h-3 w-20 bg-gray-100 rounded mt-1" />
              </div>
            </div>
            <div className="h-28 bg-gray-100 rounded mt-4" />
            <div className="flex justify-between text-sm text-gray-500 mt-3">
              <span>👍 0</span>
              <span>💬 0</span>
              <span>↗️ Compartir</span>
            </div>
          </article>
        ))}
      </section>

      {/* BENEFICIOS */}
      <section className="mt-16">
        <h2 className="text-2xl text-center font-semibold mb-6">¿Por qué Capifriends?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border rounded-xl p-5">
            <h3 className="font-semibold">Privacidad primero</h3>
            <p className="text-gray-600 mt-2 text-sm">
              RLS en PostgreSQL para que solo tú controles tus datos.
            </p>
          </div>
          <div className="border rounded-xl p-5">
            <h3 className="font-semibold">Contenido en tiempo real</h3>
            <p className="text-gray-600 mt-2 text-sm">
              Actualizaciones instantáneas con Supabase Realtime.
            </p>
          </div>
          <div className="border rounded-xl p-5">
            <h3 className="font-semibold">Diseño moderno</h3>
            <p className="text-gray-600 mt-2 text-sm">
              Tailwind para velocidad, accesibilidad y consistencia.
            </p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="text-center py-16">
        <h2 className="text-2xl font-semibold">¿Listo para empezar?</h2>
        <div className="mt-4 flex items-center justify-center gap-4">
          <Link href="/signup" className="px-5 py-2.5 bg-blue-600 text-white rounded-md">
            Crear cuenta
          </Link>
          <Link href="/login" className="px-5 py-2.5 bg-gray-900 text-white rounded-md">
            Entrar
          </Link>
        </div>
      </section>
    </div>
  );
}
