"use client";
import { useActionState } from "react";
import { signOut } from "@/app/(auth)/actions";

export default function SignOutButton({ className = "" }) {
  const [state, formAction, pending] = useActionState(signOut, null);

  return (
    <form action={formAction}>
      <button
        type="submit"
        className={className || "px-3 py-2 rounded-md bg-foreground text-background text-sm"}
        disabled={pending}
      >
        {pending ? "Cerrando sesión..." : "Cerrar sesión"}
      </button>
    </form>
  );
}
