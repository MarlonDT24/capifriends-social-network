// components/notifications/NotificationsDropdown.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { acceptFriendRequestForm, declineFriendRequestForm } from "@/app/friends/actions";

export default function NotificationsDropdown({ initialCount = 0 }) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const ref = useRef(null);
  const btnRef = useRef(null);

  function toggle() {
    setOpen((v) => !v);
  }

  // Cerrar con click fuera
  useEffect(() => {
    function onDocClick(e) {
      if (!ref.current) return;
      if (ref.current.contains(e.target)) return;
      if (btnRef.current && btnRef.current.contains(e.target)) return;
      setOpen(false);
    }
    function onEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("click", onDocClick, true);
    document.addEventListener("keydown", onEsc, true);
    return () => {
      document.removeEventListener("click", onDocClick, true);
      document.removeEventListener("keydown", onEsc, true);
    };
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications/inbox", { cache: "no-store" });
      const json = await res.json();
      setItems(json.items || []);
      setCount(json.count || 0);
    } finally {
      setLoading(false);
    }
  }

  // Cargar cuando se abre
  useEffect(() => {
    if (open) refresh();
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls="notif-popover"
        className="relative grid h-9 w-9 place-items-center rounded-full border border-border bg-background hover:bg-accent"
        title="Notificaciones"
      >
        {/* Campana nítida (trazos) */}
        <svg
          className="h-5 w-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.7 1.7 0 0 0 3.4 0" />
        </svg>

        {/* Badge en absoluto */}
        {count > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-medium leading-none text-white">
            {count}
          </span>
        )}
      </button>

      {/* Popover */}
      {open && (
        <div
          ref={ref}
          id="notif-popover"
          role="dialog"
          aria-label="Notificaciones"
          className="absolute right-0 mt-2 w-[320px] sm:w-[360px] rounded-xl border bg-popover text-popover-foreground shadow-lg z-20"
        >
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div className="font-medium">Notificaciones</div>
            <button
              className="text-xs rounded border px-2 py-1 hover:bg-accent"
              onClick={refresh}
              disabled={loading}
            >
              {loading ? "Cargando..." : "Actualizar"}
            </button>
          </div>

          <ul className="max-h-[360px] overflow-auto p-2 space-y-2">
            {items.length === 0 && (
              <li className="text-sm text-muted-foreground px-2 py-6 text-center">
                No tienes notificaciones nuevas.
              </li>
            )}

            {items.map((it) => (
              <li key={it.id} className="rounded-lg border p-2 bg-card">
                <div className="flex items-start gap-3">
                  <img
                    src={it.requester?.avatar_url || "/profile_icon.png"}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">@{it.requester?.username || "usuario"}</span>{" "}
                      te ha enviado una solicitud de amistad.
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {new Date(it.created_at).toLocaleString()}
                    </p>

                    {/* Acciones aceptar/declinar usando tus server actions */}
                    <div className="mt-2 flex items-center gap-2">
                      <form action={acceptFriendRequestForm}>
                        <input type="hidden" name="requestId" value={it.id} />
                        <button className="rounded bg-blue-600 text-white text-xs px-3 py-1 hover:opacity-90">
                          Confirmar
                        </button>
                      </form>
                      <form action={declineFriendRequestForm}>
                        <input type="hidden" name="requestId" value={it.id} />
                        <button className="rounded border text-xs px-3 py-1 hover:bg-accent">
                          Rechazar
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t px-3 py-2 text-right">
            <Link href="/friends" className="text-xs underline underline-offset-2">
              Ver todas
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
