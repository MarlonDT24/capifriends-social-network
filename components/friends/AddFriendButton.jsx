"use client";
import { useActionState } from "react";
import { sendFriendRequest } from "@/app/friends/actions";

/**
 * Pequeño formulario controlado por Server Action.
 * - Puedes pasar username o addressee_id (usa UNO de los dos).
 * - Muestra estado de envío y mensaje de respuesta.
 */

export default function AddFriendButton({ username, addresseeId }) {
  // Ligamos la Server Action al <form>. state puede traer {ok, message}
  const [state, formAction, pending] = useActionState(sendFriendRequest, null);

  return (
    <form action={formAction} className="flex items-center gap-2">
      {/* Si ya lo conoces, manda oculto el id. Si no, manda username */}
      {addresseeId ? (
        <input type="hidden" name="addressee_id" value={addresseeId} />
      ) : (
        <input
          name="username"
          defaultValue={username || ""}
          placeholder="usuario..."
          className="border rounded px-2 py-1"
        />
      )}

      <button
        disabled={pending}
        className="rounded bg-blue-600 text-white px-3 py-1 disabled:opacity-50"
      >
        {pending ? "Enviando..." : "Agregar"}
      </button>

      {/* Mensaje devuelto por la acción */}
      {state?.message && (
        <span className={`text-sm ${state.ok ? "text-green-600" : "text-red-600"}`}>
          {state.message}
        </span>
      )}
    </form>
  );
}