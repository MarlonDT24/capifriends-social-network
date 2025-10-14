"use server";
import { createServerSupabase } from "@/lib/supabaseServer";
/**
 * ============================================================================
 * BÚSQUEDA RÁPIDA PARA DROPDOWN DEL NAVBAR
 * ============================================================================
 *
 * Esta Server Action busca usuarios en tiempo real mientras el usuario escribe.
 * Se optimiza para mostrar solo los 5 resultados más relevantes en el dropdown.
 *
 * FLUJO:
 * 1. Valida que el query tenga al menos 2 caracteres
 * 2. Busca en la BD usuarios que coincidan con username o nombre
 * 3. Ordena resultados por relevancia (exacto > empieza con > contiene)
 * 4. Obtiene el estado de relación de amistad con cada usuario
 * 5. Retorna top 5 usuarios con su información de relación
 *
 * @param {string} query - Texto que el usuario está escribiendo en el buscador
 * @returns {Promise<{ok: boolean, users: Array, message?: string}>}
 */

export async function quickSearchUsers(query) {
  //1. Validación inicial
  // Si el query está vacío o tiene menos de 2 caracteres, no hacemos búsqueda
  // Esto evita consultas innecesarias a la BD y mejora el rendimiento
  if (!query || query.trim().length < 2) {
    return { ok: true, users: [] }; // Requiere al menos 2 caracteres para buscar
  }

  //2. Autenticación y conexión a BD
  const supabase = await createServerSupabase();
  //Obtenemos el usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();

  //Limpiamos el query de espacios innecesarios
  const q = query.trim();

  //3. Busqueda en la BD
  // Buscamos perfiles que coincidan con el query en username O nombre completo
  // - ilike: búsqueda case-insensitive (no distingue mayúsculas/minúsculas)
  // - %${q}%: el % es un wildcard que busca el texto en cualquier posición
  // Ejemplo: "dan" encontrará "daniel", "jordan", "daniela"
  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
    .order("username", { ascending: true }) //Orden alfabético por username
    .limit(20); //Solo los 20 primeros resultados para optimizar

  // Si hay error en la consulta, retornamos el mensaje
  if (error) {
    return { ok: false, message: error.message, users: [] };
  }

  //4. Filtrado y orden de resultados por relevancia
  //Filtramos al usuario actual para que no aparezca en los resultados
  let results = (data ?? []).filter((p) => p.id !== user?.id);

  // Ordenamos por RELEVANCIA (no solo alfabético):
  // 1° prioridad: username exacto (ej: busca "daniel" → @daniel)
  // 2° prioridad: username que empieza con query (ej: busca "dan" → @daniel, @daniela)
  // 3° prioridad: username que contiene query (ej: busca "dan" → @jordan)
  // 4° prioridad: nombre completo que contiene query
  results.sort((a, b) => {
    const aUsername = a.username.toLowerCase();
    const bUsername = b.username.toLowerCase();
    const qLower = q.toLowerCase();

    // CASO 1: Username exacto tiene máxima prioridad
    // Si "a" es exacto y "b" no, "a" va primero (return -1)
    if (aUsername === qLower) return -1;
    if (bUsername === qLower) return 1;

    // CASO 2: Username que empieza con el query
    // Ejemplo: buscar "dan" → @daniel va antes que @jordan
    const aStarts = aUsername.startsWith(qLower);
    const bStarts = bUsername.startsWith(qLower);
    if (aStarts && !bStarts) return -1;
    if (!aStarts && bStarts) return 1;

    // CASO 3: Si empatan en las reglas anteriores, orden alfabético
    return aUsername.localeCompare(bUsername);
  });

  // Tomamos solo los primeros 5 resultados para el dropdown
  results = results.slice(0, 5);

  //5. Obtenemos estado de relación de amistad
  // Solo si hay usuario autenticado y hay resultados
  const relMap = new Map(); // Mapa: userId -> {id, status, role}

  if (user && results.length > 0) {
    // Array de IDs de los usuarios encontrados
    const ids = results.map((r) => r.id);

    // 5.1: SOLICITUDES QUE YO ENVIÉ (outgoing)
    // Buscamos en friendships donde YO soy el requester y el addressee es alguno de los usuarios encontrados
    const { data: outRows } = await supabase
      .from("friendships")
      .select("id, requester_id, addressee_id, status")
      .eq("requester_id", user.id) // YO soy quien envió
      .in("addressee_id", ids); // ELLOS recibieron

    // 5.2: SOLICITUDES QUE YO RECIBÍ (incoming)
    // Buscamos en friendships donde YO soy el addressee y el requester es alguno de los usuarios encontrados
    const { data: inRows } = await supabase
      .from("friendships")
      .select("id, requester_id, addressee_id, status")
      .eq("addressee_id", user.id) // YO soy quien recibió
      .in("requester_id", ids); // ELLOS enviaron

    // 5.3: CONSTRUIR MAPA DE RELACIONES
    // Combinamos ambos arrays y creamos el mapa
    for (const r of [...(outRows ?? []), ...(inRows ?? [])]) {
      // Determinamos el rol:
      // - "out" = yo envié la solicitud
      // - "in" = yo recibí la solicitud
      const role = r.requester_id === user.id ? "out" : "in";

      // Identificamos al "otro" usuario (no yo)
      const otherId = role === "out" ? r.addressee_id : r.requester_id;

      // Guardamos en el mapa: otherId -> {id de friendship, status, role}
      relMap.set(otherId, {
        id: r.id, // ID de la fila en friendships (para cancelar/aceptar)
        status: r.status, // "pending" | "accepted" | "declined"
        role: role, // "out" | "in"
      });
    }
  }

  //6. Preparamos la respuesta final
  // Añadimos la información de relación a cada usuario
  const usersWithRelationship = results.map((u) => ({
    ...u,                                    // id, username, full_name, avatar_url
    relationship: relMap.get(u.id) || null  // {id, status, role} o null
  }));

  // Retornamos el resultado
  return { ok: true, users: usersWithRelationship };

}
