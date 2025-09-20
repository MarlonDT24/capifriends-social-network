"use client";
import { useActionState } from "react";
import { sendFriendRequest, acceptFriendRequestForm, declineFriendRequestForm, cancelFriendRequestForm, unfriendForm } from "@/app/friends/actions";

/**
 * Pequeño formulario controlado por Server Action.
 * - Puedes pasar username o addressee_id (usa UNO de los dos).
 * - Muestra estado de envío y mensaje de respuesta.
 */

export default function AddFriendButton({ username, addresseeId, relationship }) {
  // Ligamos la Server Action al <form>. state puede traer {ok, message}
  const [, sendAction, sending] = useActionState(sendFriendRequest, null);
  const [, acceptAction, accepting] = useActionState(acceptFriendRequestForm, null);
  const [, declineAction, declining] = useActionState(declineFriendRequestForm, null);
  const [, cancelAction, cancelling] = useActionState(cancelFriendRequestForm, null);
  const [, unfriendAction, unfriending] = useActionState(unfriendForm, null);

   // 1) No hay relación -> Agregar
  if (!relationship) {
    return (
      <form action={sendAction}>
        {addresseeId ? (
          <input type="hidden" name="addressee_id" value={addresseeId} />
        ) : (
          <input type="hidden" name="username" value={username || ""} />
        )}
        <button
          className="rounded bg-blue-600 text-white px-3 py-1 text-sm disabled:opacity-50"
          disabled={sending}
        >
          {sending ? "Enviando..." : "Agregar"}
        </button>
      </form>
    );
  }

  // 2) Ya somos amigos -> Mostrar “Amigos” + Eliminar
  if (relationship.status === "accepted") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs rounded-full border px-2 py-1 text-muted-foreground">
          Amigos
        </span>
        <form action={unfriendAction}>
          <input type="hidden" name="otherId" value={addresseeId} />
          <button
            className="rounded border px-3 py-1 text-sm hover:bg-accent disabled:opacity-50"
            disabled={unfriending}
          >
            {unfriending ? "Eliminando..." : "Eliminar"}
          </button>
        </form>
      </div>
    );
  }

  // 3) Pendiente — yo la envié -> Cancelar
  if (relationship.status === "pending" && relationship.role === "out") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs rounded-full border px-2 py-1 text-muted-foreground">
          Pendiente
        </span>
        <form action={cancelAction}>
          <input type="hidden" name="requestId" value={relationship.id} />
          <button
            className="rounded border px-3 py-1 text-sm hover:bg-accent disabled:opacity-50"
            disabled={cancelling}
          >
            {cancelling ? "Cancelando..." : "Cancelar"}
          </button>
        </form>
      </div>
    );
  }

  // 4) Pendiente — me la enviaron -> Aceptar / Rechazar
  if (relationship.status === "pending" && relationship.role === "in") {
    return (
      <div className="flex items-center gap-2">
        <form action={acceptAction}>
          <input type="hidden" name="requestId" value={relationship.id} />
          <button
            className="rounded bg-blue-600 text-white px-3 py-1 text-sm hover:opacity-90 disabled:opacity-50"
            disabled={accepting}
          >
            {accepting ? "Aceptando..." : "Aceptar"}
          </button>
        </form>
        <form action={declineAction}>
          <input type="hidden" name="requestId" value={relationship.id} />
          <button
            className="rounded border px-3 py-1 text-sm hover:bg-accent disabled:opacity-50"
            disabled={declining}
          >
            {declining ? "Rechazando..." : "Rechazar"}
          </button>
        </form>
      </div>
    );
  }

  // 5) Cualquier otro estado -> volver a permitir enviar
  return (
    <form action={sendAction}>
      {addresseeId ? (
        <input type="hidden" name="addressee_id" value={addresseeId} />
      ) : (
        <input type="hidden" name="username" value={username || ""} />
      )}
      <button className="rounded bg-blue-600 text-white px-3 py-1 text-sm disabled:opacity-50">
        Agregar
      </button>
    </form>
  );
}