"use client";

export default function RightSidebar() {
  return (
    <div className="space-y-6">
      <section>
        <h3 className="text-sm font-semibold">A quién seguir</h3>
        <ul className="text-sm space-y-2">
          <li className="flex items-center justify-between">
            <span>@maria</span>
            <button className="text-xs px-2 py-1 rounded bg-brand text-white">Seguir</button>
          </li>
          <li className="flex items-center justify-between">
            <span>@juan</span>
            <button className="text-xs px-2 py-1 rounded bg-brand text-white">Seguir</button>
          </li>
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold">Amigos conectados</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>Andrea • En línea</li>
          <li>Carlos • En línea</li>
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold">Mensajes</h3>
        <p className="text-sm text-muted-foreground">
          Próximamente: chats y notificaciones en tiempo real.
        </p>
      </section>
    </div>
  );
}