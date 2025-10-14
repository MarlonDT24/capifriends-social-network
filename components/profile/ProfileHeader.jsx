"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  UserCheck,
  UserX,
  Clock,
  Settings,
  Share2,
  Calendar,
} from "lucide-react";
import {
  sendFriendRequest,
  acceptFriendRequestAction,
  declineFriendRequestAction,
  cancelFriendRequestAction,
  unfriendAction,
} from "@/app/friends/actions";

export default function ProfileHeader({
  profile,
  stats,
  isOwnProfile,
  friendshipStatus,
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentFriendshipStatus, setCurrentFriendshipStatus] =
    useState(friendshipStatus);

  // Función para manejar solicitudes de amistad
  const handleFriendshipAction = async (action) => {
    startTransition(async () => {
      try {
        let result;

        switch (action) {
          case "send":
            const formData = new FormData();
            formData.append("addressee_id", profile.id);
            result = await sendFriendRequest(null, formData);
            if (result.ok) {
              setCurrentFriendshipStatus({ status: "pending", isSentByMe: true });
            } else if (result.message) {
              alert(result.message);
            }
            break;

          case "accept":
            if (!currentFriendshipStatus?.id) {
              alert("No se encontró la solicitud");
              return;
            }
            result = await acceptFriendRequestAction(currentFriendshipStatus.id);
            if (result.ok) {
              setCurrentFriendshipStatus({ 
                ...currentFriendshipStatus, 
                status: "accepted" 
              });
            } else if (result.message) {
              alert(result.message);
            }
            break;

          case "reject":
            if (!currentFriendshipStatus?.id) {
              alert("No se encontró la solicitud");
              return;
            }
            result = await declineFriendRequestAction(currentFriendshipStatus.id);
            if (result.ok) {
              setCurrentFriendshipStatus(null);
            } else if (result.message) {
              alert(result.message);
            }
            break;

          case "cancel":
            if (!currentFriendshipStatus?.id) {
              alert("No se encontró la solicitud");
              return;
            }
            result = await cancelFriendRequestAction(currentFriendshipStatus.id);
            if (result.ok) {
              setCurrentFriendshipStatus(null);
            } else if (result.message) {
              alert(result.message);
            }
            break;

          case "remove":
            result = await unfriendAction(profile.id);
            if (result.ok) {
              setCurrentFriendshipStatus(null);
            } else if (result.message) {
              alert(result.message);
            }
            break;

          default:
            console.error("Acción no válida:", action);
            return;
        }

        // Refrescar la página para actualizar los datos
        router.refresh();
      } catch (error) {
        console.error("Error en acción de amistad:", error);
        alert("Ocurrió un error. Intenta de nuevo.");
      }
    });
  };

  // Función para compartir perfil
  const handleShare = async () => {
    const profileUrl = `${window.location.origin}/profile/${profile.username}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Perfil de ${profile.full_name || profile.username}`,
          text: `Mira el perfil de ${
            profile.full_name || profile.username
          } en Capifriends`,
          url: profileUrl,
        });
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error al compartir:", error);
        }
      }
    } else {
      // Fallback: copiar al portapapeles
      try {
        await navigator.clipboard.writeText(profileUrl);
        alert("Enlace copiado al portapapeles");
      } catch (error) {
        console.error("Error al copiar:", error);
      }
    }
  };

  // Renderizar botón según estado de amistad
  const renderActionButton = () => {
    if (isOwnProfile) {
      return (
        <button
          onClick={() => router.push("/profile/edit")}
          className="flex items-center gap-2 px-6 py-2.5 bg-ocean-secondary text-white rounded-xl hover:bg-ocean-primary smooth-transition font-medium"
        >
          <Settings className="w-4 h-4" />
          Editar perfil
        </button>
      );
    }

    if (!currentFriendshipStatus) {
      return (
        <button
          onClick={() => handleFriendshipAction("send")}
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-nature-secondary text-white rounded-xl hover:bg-nature-primary smooth-transition font-medium disabled:opacity-50"
        >
          <UserPlus className="w-4 h-4" />
          Agregar amigo
        </button>
      );
    }

    if (currentFriendshipStatus.status === "pending") {
      if (currentFriendshipStatus.isSentByMe) {
        return (
          <button
            onClick={() => handleFriendshipAction("cancel")}
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 bg-muted text-muted-foreground rounded-xl hover:bg-border smooth-transition font-medium disabled:opacity-50"
          >
            <Clock className="w-4 h-4" />
            Solicitud enviada
          </button>
        );
      } else {
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleFriendshipAction("accept")}
              disabled={isPending}
              className="flex items-center gap-2 px-6 py-2.5 bg-nature-secondary text-white rounded-xl hover:bg-nature-primary smooth-transition font-medium disabled:opacity-50"
            >
              <UserCheck className="w-4 h-4" />
              Aceptar
            </button>
            <button
              onClick={() => handleFriendshipAction("reject")}
              disabled={isPending}
              className="flex items-center gap-2 px-4 py-2.5 bg-muted text-muted-foreground rounded-xl hover:bg-border smooth-transition font-medium disabled:opacity-50"
            >
              <UserX className="w-4 h-4" />
            </button>
          </div>
        );
      }
    }

    if (currentFriendshipStatus.status === "accepted") {
      return (
        <button
          onClick={() => handleFriendshipAction("remove")}
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-2.5 bg-muted text-muted-foreground rounded-xl hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 dark:hover:text-red-400 smooth-transition font-medium disabled:opacity-50"
        >
          <UserCheck className="w-4 h-4" />
          Amigos
        </button>
      );
    }
  };

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Banner superior con gradiente */}
      <div className="h-32 sm:h-40 ocean-gradient relative">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.3),transparent_70%)]" />
        </div>
      </div>

      {/* Contenido del perfil */}
      <div className="px-6 pb-6">
        {/* Avatar y botones */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-16 sm:-mt-20">
          {/* Avatar */}
          <div className="relative">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full border-4 border-background overflow-hidden bg-muted shadow-lg">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt={profile.full_name || profile.username}
                  width={160}
                  height={160}
                  className="w-full h-full object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-ocean-light text-ocean-primary text-4xl sm:text-5xl font-bold">
                  {(
                    profile.full_name?.[0] || profile.username[0]
                  ).toUpperCase()}
                </div>
              )}
            </div>
            {/* Indicador de estado online */}
            <div className="absolute bottom-2 right-2 w-6 h-6 bg-nature-secondary border-4 border-background rounded-full" />
          </div>

          {/* Botones de acción */}
          <div className="flex items-center gap-2 sm:mb-4">
            {renderActionButton()}
            <button
              onClick={handleShare}
              className="p-2.5 bg-muted text-muted-foreground rounded-xl hover:bg-border smooth-transition"
              aria-label="Compartir perfil"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Información del usuario */}
        <div className="mt-4 space-y-4">
          {/* Nombre y username */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {profile.full_name || profile.username}
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              @{profile.username}
            </p>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-foreground leading-relaxed max-w-2xl">
              {profile.bio}
            </p>
          )}

          {/* Estadísticas */}
          <div className="flex items-center gap-6 pt-2">
            <div className="text-center sm:text-left">
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {stats.postsCount}
              </div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center sm:text-left">
              <div className="text-xl sm:text-2xl font-bold text-foreground">
                {stats.friendsCount}
              </div>
              <div className="text-sm text-muted-foreground">Amigos</div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="flex flex-wrap items-center gap-4 pt-2 text-sm text-muted-foreground">
            {profile.created_at && (
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>
                  Se unió en{" "}
                  {new Date(profile.created_at).toLocaleDateString("es-ES", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}