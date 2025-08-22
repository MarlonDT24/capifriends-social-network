"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState("es");
  const [mobileSearch, setMobileSearch] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  // Lee el idioma guardado y lo aplica al <html>
  useEffect(() => {
    // La variable saved recupera el idioma guardado en localStorage bajo la clave "capifriends:lang"
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem("capifriends:lang")
        : null;
    // La variable initial establece el idioma inicial, usando el guardado o "es" por defecto
    const initial = saved || "es";
    setLang(initial);
    // Si el objeto document está disponible (navegador), actualiza el atributo lang del elemento <html>
    if (typeof document !== "undefined") {
      document.documentElement.lang = initial;
    }
    // Esto ayuda a los navegadores y tecnologías de asistencia a interpretar correctamente el idioma de la página.
  }, []);

  // Cambia el idioma (versión simple). Más adelante lo uniremos a i18n.
  function onChangeLang(next) {
    setLang(next);
    if (typeof document !== "undefined") {
      document.documentElement.lang = next;
    }
    localStorage.setItem("capifriends:lang", next);
  }

  // Buscar → navega a /search?q=...
  function onSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setMobileSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    /* NAVBAR */
    <header className="bg-header-background text-header-foreground sticky top-0 border-b">
      <nav
        className="max-w-6xl mx-auto flex items-center justify-between p-4"
        aria-label="Principal"
      >
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo_capifriends.png"
            alt="Capifriends logo"
            width={120}
            height={120}
            className="rounded"
            priority
          />
        </Link>

        {/* BUSCADOR */}
        <form
          onSubmit={onSearch}
          className="flex-1 hidden md:flex items-center justify-center"
        >
          <div className="w-full max-w-md flex items-center gap-2 border border-border rounded-full px-3 py-1.5 bg-background">
            <input
              aria-label="Buscar"
              type="search"
              placeholder="Buscar personas, publicaciones o comunidades..."
              className="flex-1 bg-transparent outline-none text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-full bg-brand text-brand-foreground text-sm font-medium hover:opacity-90"
            >
              Buscar
            </button>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2">
          {/* Botón buscar (solo mobile) */}
          <button
            type="button"
            onClick={() => {
              setMobileSearch((v) => !v);
              setMobileMenu(false);
            }}
            className="md:hidden rounded-md border border-border px-2 py-1 text-sm bg-background"
            aria-expanded={mobileSearch}
            aria-controls="mobile-search"
            aria-label="Abrir buscador"
          >
            🔍
          </button>

          {/* BTN IDIOMA */}
          <label className="sr-only" htmlFor="lang">
            Idioma
          </label>
          <select
            id="lang"
            value={lang}
            onChange={(e) => onChangeLang(e.target.value)}
            className="border border-border rounded-md bg-background px-2 py-1 text-sm"
          >
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>

          {/* BTNS CUENTA */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/signup"
              className="px-3 py-1.5 text-sm rounded-md bg-foreground text-background hover:opacity-90"
            >
              Registrarse
            </Link>
            <Link
              href="/login"
              className="px-3 py-1.5 text-sm rounded-md bg-seconground text-brand-foreground hover:opacity-90"
            >
              Iniciar sesión
            </Link>
          </div>

          {/* Menú hamburguesa (solo mobile) */}
          <button
            type="button"
            onClick={() => {
              setMobileMenu((v) => !v);
              setMobileSearch(false);
            }}
            className="md:hidden rounded-md border border-border px-2 py-1 text-sm bg-background"
            aria-expanded={mobileMenu}
            aria-controls="mobile-menu"
            aria-label="Abrir menú"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* Buscador mobile (se muestra/oculta) */}
      {mobileSearch && (
        <div
          id="mobile-search"
          className="border-t border-border bg-header-background md:hidden"
        >
          <form onSubmit={onSearch} className="max-w-6xl mx-auto p-3">
            <div className="w-full flex items-center gap-2 border border-border rounded-full px-3 py-1.5 bg-background">
              <input
                aria-label="Buscar"
                type="search"
                placeholder="Buscar personas, publicaciones o comunidades..."
                className="flex-1 bg-transparent outline-none text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-full bg-brand text-brand-foreground text-sm font-medium hover:opacity-90"
              >
                Buscar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Menú mobile (se muestra/oculta) */}
      {mobileMenu && (
        <div
          id="mobile-menu"
          className="border-t border-border bg-header-background md:hidden"
        >
          <div className="max-w-6xl mx-auto p-4 flex flex-col gap-3">
            <Link
              href="/signup"
              className="w-full text-center px-3 py-2 rounded-md bg-foreground text-background text-sm font-medium"
              onClick={() => setMobileMenu(false)}
            >
              Registrarse
            </Link>
            <Link
              href="/login"
              className="w-full text-center px-3 py-2 rounded-md bg-brand text-brand-foreground text-sm font-medium"
              onClick={() => setMobileMenu(false)}
            >
              Iniciar sesión
            </Link>

            {/* Links a futuro */}
            <div className="mt-1 flex flex-col gap-2 text-sm text-muted-foreground">
              <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
                Sobre Capifriends
              </Link>
              <Link href="/explore" onClick={() => setMobileMenuOpen(false)}>
                Explorar
              </Link>
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                Contacto
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
