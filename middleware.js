import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req) {
  // NextResponse.next() deja pasar la request; lo usaremos como "response base"
  const res = NextResponse.next();

  // Cliente Supabase para Edge, con adaptador de cookies manual
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          // persiste cambios de sesión en la respuesta
          res.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          res.cookies.set({ name, value: "", ...options });
          res.cookies.delete(name);
        },
      },
    }
  );

  //Obtenemos la sesión si el usuario está autenticado.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = req.nextUrl.pathname;
  const redirectedFrom = `${pathname}${req.nextUrl.search || ""}`;

  //Rutas protegidas que requieren autenticación
  const protectedPaths = ["/feed", "/profile/edit"];

  // ¿La URL actual empieza por alguna de las protegidas?
  const isProtected = protectedPaths.some((p) =>
    pathname.startsWith(p)
  );

  // Si la ruta es protegida y NO hay sesión → redirige a /login
  if (isProtected && !session) {
    const url = req.nextUrl.clone();
    url.pathname = "/login"; // a dónde rediriges
    // guardamos de dónde venía para volver tras login
    url.searchParams.set("redirectedFrom", redirectedFrom);
    return NextResponse.redirect(url);
  }

  // 2) Si ya estoy autenticado y voy a /login o /signup → redirigir al feed
  const authOnly = ["/login", "/signup"];
  const isAuthOnly = authOnly.includes(pathname);
  if (isAuthOnly && session) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  // Si hay sesión, o no era protegida, deja pasar la request
  return res;
}

//Se evita que corra en todo (mejor rendimiento).
export const config = {
  matcher: ["/feed/:path*", "/profile/edit/:path*", "/login", "/signup"],
};
