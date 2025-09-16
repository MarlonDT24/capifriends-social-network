"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SearchBox from "@/components/nav/SearchBox";
import LangSwitcher from "@/components/nav/LangSwitcher";
import UserMenu from "@/components/nav/UserMenu";
import SignOutButton from "@/components/SignOutButton";
import NotificationsDropdown from "@/components/notifications/NotificationsDropdown";

export default function NavbarClient({
  user,
  profile,
  notificationsCount = 0,
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [lang, setLang] = useState("es");
  const [mobileSearch, setMobileSearch] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
    if (typeof document !== "undefined")
      document.documentElement.lang = initial;
  }, []);
  // Esto ayuda a los navegadores y tecnologías de asistencia a interpretar correctamente el idioma de la página.
  const onChangeLang = (next) => {
    setLang(next);
    if (typeof document !== "undefined") document.documentElement.lang = next;
    localStorage.setItem("capifriends:lang", next);
  };

  // Buscar → navega a /search?q=...
  function onSearch(e) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setMobileSearch(false);
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

        {/* Desktop: buscador centrado */}
        <div className="hidden md:flex flex-1 items-center justify-center px-12">
          <SearchBox
            query={query}
            setQuery={setQuery}
            onSubmit={onSearch}
            // Ancho responsive: 36rem/48rem/56rem aprox según viewport
            className="max-w-xl lg:max-w-2xl xl:max-w-3xl"
          />
        </div>

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
          <LangSwitcher value={lang} onChange={onChangeLang} />

          {/* Zona de cuenta */}
          <div className="hidden md:flex items-center gap-2">
            {!user ? (
              <>
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
              </>
            ) : (
              <>
                <NotificationsDropdown initialCount={notificationsCount} />
                <UserMenu
                  user={user}
                  profile={profile}
                  open={menuOpen}
                  setOpen={setMenuOpen}
                />
              </>
            )}
          </div>

          {/* Mobile: hamburguesa */}
          {/* Campanita en mobile (icono arriba) */}
          {user && (
            <div className="md:hidden">
              <NotificationsDropdown initialCount={notificationsCount} />
            </div>
          )}
          {/* Hamburguesa al final para mantener orden y evitar solapes */}
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
          <div className="max-w-6xl mx-auto p-3">
            <SearchBox query={query} setQuery={setQuery} onSubmit={onSearch} />
          </div>
        </div>
      )}

      {/* Menú mobile (se muestra/oculta) */}
      {mobileMenu && (
        <div
          id="mobile-menu"
          className="border-t border-border bg-header-background md:hidden"
        >
          <div className="max-w-6xl mx-auto p-4 flex flex-col gap-3">
            {!user ? (
              <>
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
              </>
            ) : (
              <>
                <Link
                  href="/feed"
                  className="w-full text-center px-3 py-2 rounded-md bg-background border text-sm"
                  onClick={() => setMobileMenu(false)}
                >
                  Feed
                </Link>
                <Link
                  href="/profile/edit"
                  className="w-full text-center px-3 py-2 rounded-md bg-background border text-sm"
                  onClick={() => setMobileMenu(false)}
                >
                  Mi perfil
                </Link>
                <SignOutButton className="w-full text-center px-3 py-2 rounded-md bg-foreground text-background text-sm" />
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
