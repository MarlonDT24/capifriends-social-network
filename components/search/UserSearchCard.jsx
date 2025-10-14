"use client";
import Link from "next/link";
import { useActionState } from "react";
import {
  sendFriendRequest,
  cancelFriendRequestForm,
  unfriendForm,
} from "@/app/friends/actions";
/**
 * ============================================================================
 * CARD DE USUARIO PARA RESULTADOS DE BÚSQUEDA
 * ============================================================================
 *
 * Componente que renderiza UN resultado individual en el dropdown de búsqueda.
 *
 * CARACTERÍSTICAS:
 * - Todo el card es clickeable y navega al perfil del usuario
 * - Muestra avatar, nombre completo y username
 * - Renderiza botón contextual según el estado de amistad
 * - El botón NO navega (previene propagación del click)
 *
 * ESTADOS DE RELACIÓN POSIBLES:
 * 1. null → Sin relación → Botón "Seguir"
 * 2. accepted → Son amigos → Badge "Amigos"
 * 3. pending + role="out" → YO envié solicitud → Badge "Pendiente"
 * 4. pending + role="in" → ME enviaron solicitud → Badge "Responder"
 *
 * @param {Object} user - Usuario a mostrar
 * @param {string} user.id - UUID del usuario
 * @param {string} user.username - Nombre de usuario (@username)
 * @param {string} user.full_name - Nombre completo
 * @param {string} user.avatar_url - URL del avatar
 * @param {Object|null} user.relationship - Estado de amistad
 * @param {Function} onClose - Callback para cerrar el dropdown
 */

export default function UserSearchCard({ user, onClose }) {
  //1. Destructuramos props
  // Extraemos las propiedades del usuario para usarlas más fácilmente
  const { id, username, full_name, avatar_url, relationship } = user;

  //2. Hooks de estado para acciones(server actions)
  // useActionState vincula Server Actions con el formulario
  // Retorna: [state, action, isPending]
  // - state: respuesta de la última ejecución {ok, message}
  // - action: función para pasar al <form action={...}>
  // - isPending: boolean que indica si está ejecutándose

  //Acción para enviar solicitud de amistad
  const [, sendAction, sending] = useActionState(sendFriendRequest, null);

  //Acción para cancelar solicitud enviada
  const [, cancelAction, cancelling] = useActionState(
    cancelFriendRequestForm,
    null
  );

  //Acción para eliminar amistad
  const [, unfriendAction, unfriending] = useActionState(unfriendForm, null);

  //3. Lógica para renderizar botón contextual
  //Determinamos qué botón/badge mostrar según el estado de relación. Esta función es el "cerebro" del componente
  const renderActionButton = () => {
    // CASO 1: Sin relación (relationship === null)
    // Si no hay ninguna relación entre los usuarios, mostramos "Seguir"
    if (!relationship) {
      return (
        <form action={sendAction}>
          {/* Input oculto con el ID del destinatario */}
          <input type="hidden" name="addressee_id" value={id} />

          <button
            className="rounded-full bg-blue-600 text-white px-4 py-1 text-xs font-medium hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
            disabled={sending}
          >
            {/* Muestra "..." mientras se ejecuta la acción */}
            {sending ? "..." : "Seguir"}
          </button>
        </form>
      );
    }

    // CASO 2: Ya son amigos (relationship.status === "accepted")
    // Mostramos un badge informativo "Amigos" sin acción
    // (podríamos agregar un menú desplegable para "Dejar de seguir" si quisieras)
    if (relationship.status === "accepted") {
      return (
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground whitespace-nowrap">
          Amigos
        </span>
      );
    }

    // CASO 3: Solicitud pendiente SALIENTE (YO la envié)
    // status === "pending" && role === "out"
    // El usuario actual envió la solicitud y está esperando respuesta
    if (relationship.status === "pending" && relationship.role === "out") {
      return (
        <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground whitespace-nowrap">
          Pendiente
        </span>
      );
    }

    // CASO 4: Solicitud pendiente ENTRANTE (ME la enviaron)
    // status === "pending" && role === "in"
    // El otro usuario envió la solicitud, el actual puede responder
    // Mostramos badge azul "Responder" que sugiere acción disponible
    if (relationship.status === "pending" && relationship.role === "in") {
      return (
        <span className="rounded-full border border-blue-600 text-blue-600 px-3 py-1 text-xs font-medium whitespace-nowrap">
          Responder
        </span>
      );
    }

    // CASO 5: Estados no contemplados
    // Si llegamos aquí, hay un estado desconocido. No mostramos nada.
    return null;
  };


  //4. Renderizamos el card
  return (
    // Link que envuelve todo el card
    <Link
      href={`/profile/${username}`}
      onClick={onClose} // Cierra el dropdown al navegar
      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-accent transition-colors"
    >
      {/* ----------------------------------------------------------------------
          SECCIÓN IZQUIERDA: Avatar + Info del usuario
      ---------------------------------------------------------------------- */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Avatar */}
        <img
          src={avatar_url || "/profile_icon.png"} // Fallback si no hay avatar
          alt={full_name || username}
          className="h-10 w-10 rounded-full object-cover flex-shrink-0"
        />

        {/* Información textual */}
        <div className="min-w-0 flex-1">
          {/* Nombre completo (o username si no hay nombre) */}
          <div className="font-medium text-sm truncate">
            {full_name || username}
          </div>

          {/* Username con @ */}
          <div className="text-xs text-muted-foreground truncate">
            @{username}
          </div>
        </div>
      </div>

      {/* SECCIÓN DERECHA: Botón de acción */}
      <div
        className="flex-shrink-0"
        onClick={(e) => {
          // Prevenir navegación cuando se hace click en el botón
          // Sin esto, al hacer click en "Seguir" navegaría al perfil
          // en lugar de ejecutar la Server Action
          e.preventDefault(); // Previene el comportamiento del Link
          e.stopPropagation(); // Evita que el click burbujee al Link padre
        }}
      >
        {/* Renderiza el botón/badge apropiado */}
        {renderActionButton()}
      </div>
    </Link>
  );
}
