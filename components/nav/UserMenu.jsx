"use client";
import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";

function initials(name) {
  if (!name) return "U";
  const [a = "", b = ""] = name.trim().split(" ");
  return (a[0] + (b[0] || "")).toUpperCase();
}

export default function UserMenu({ user, profile, open, setOpen }) {
  if (!user) return null;
  const displayName = profile?.full_name || profile?.username || user.email;
  const avatarSrc = profile?.avatar_url || "/profile_icon.png";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 hover:bg-accent hover:text-accent-foreground transition"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {profile?.avatar_url ? (
           <span className="h-8 w-8 rounded-full overflow-hidden shrink-0 bg-muted">
            {/* 👇 FIX: quitar comillas en src + fallback en onError + recorte con object-cover */}
            <img
              src={avatarSrc}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/profile_icon.png";
              }}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          </span>
        ) : (
          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">
            {initials(displayName)}
          </div>
        )}
        <span className="text-sm">{displayName}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-44 rounded-md border border-border bg-background shadow-lg z-50"
        >
          <Link
            href="/feed"
            className="block px-3 py-2 text-sm hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            Feed
          </Link>
          <Link
            href="/profile/edit"
            className="block px-3 py-2 text-sm hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            Mi perfil
          </Link>
          <div className="border-t my-1" />
          <SignOutButton className="block w-full text-left px-3 py-2 text-sm hover:bg-muted" />
        </div>
      )}
    </div>
  );
}
