"use client";

export default function LeftSidebar() {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold">Navegación</h3>
      <ul className="text-sm space-y-1">
        <li><a className="hover:underline" href="/feed">Inicio</a></li>
        <li><a className="hover:underline" href="/explore">Explorar</a></li>
        <li><a className="hover:underline" href="/profile/edit">Mi perfil</a></li>
      </ul>

      <div className="mt-6">
        <h3 className="text-sm font-semibold">Tendencias</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>#capifriends</li>
          <li>#nextjs</li>
          <li>#supabase</li>
        </ul>
      </div>
    </div>
  );
}