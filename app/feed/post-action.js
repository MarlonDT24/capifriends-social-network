"use server";

/**
 * Server Actions para interacciones con posts (likes, bookmarks, comentarios, etc.)
 * 
 * Separado de action.js para mejor organización:
 * - action.js: Crear/editar posts
 * - post-action.js: Interactuar con posts existentes
 */

import { revalidatePath } from "next/cache";
import { createServerSupabaseAction } from "@/lib/supabaseServer";

/**
 * Valida que el usuario esté autenticado y devuelve la sesión
 * @param {Object} supabase - Cliente de Supabase
 * @returns {Promise<Object|null>} Sesión del usuario o null si no está autenticado
 */
async function requireAuth(supabase) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error("Usuario no autenticado");
  }
  return session;
}

/**
 * Valida que el post_id sea válido
 * @param {string} postId - ID del post a validar
 * @returns {string} Post ID validado
 */
function validatePostId(postId) {
  if (!postId || typeof postId !== 'string' || postId.trim() === '') {
    throw new Error("ID de post inválido");
  }
  return postId.trim();
}

// =====================================================
// ACTIONS PARA LIKES
// =====================================================

/**
 * Alternar el like de un post (dar like o quitar like)
 * 
 * Lógica:
 * 1. Verifica autenticación
 * 2. Busca si ya existe un like del usuario para este post
 * 3. Si existe: lo elimina (unlike)
 * 4. Si no existe: lo crea (like)
 * 5. Actualiza el contador en la tabla posts
 * 
 * @param {Object} prevState - Estado anterior (para useActionState)
 * @param {FormData} formData - Datos del formulario con post_id
 * @returns {Object} Resultado de la operación
 */
export async function toggleLike(prevState, formData) {
  try {
    const supabase = await createServerSupabaseAction();
    
    // 1. Verificar autenticación
    const session = await requireAuth(supabase);
    const userId = session.user.id;
    
    // 2. Validar post_id
    const postId = validatePostId(formData.get("post_id"));
    
    // 3. Verificar si el post existe
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", postId)
      .single();
      
    if (postError || !post) {
      return { 
        error: true, 
        message: "Post no encontrado" 
      };
    }
    
    // 4. Buscar like existente
    const { data: existingLike, error: likeError } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single();
    
    // 5. Alternar like
    if (existingLike) {
      // Ya existe like -> eliminarlo (unlike)
      const { error: deleteError } = await supabase
        .from("post_likes")
        .delete()
        .eq("id", existingLike.id);
        
      if (deleteError) {
        return { 
          error: true, 
          message: "Error al quitar like" 
        };
      }
    } else {
      // No existe like -> crearlo
      const { error: insertError } = await supabase
        .from("post_likes")
        .insert({
          post_id: postId,
          user_id: userId
        });
        
      if (insertError) {
        return { 
          error: true, 
          message: "Error al dar like" 
        };
      }
    }
    
    // 6. Revalidar página para actualizar contadores
    revalidatePath("/feed");
    
    return { 
      error: false, 
      message: existingLike ? "Like eliminado" : "Like agregado",
      action: existingLike ? "unliked" : "liked"
    };
    
  } catch (error) {
    console.error("Error en toggleLike:", error);
    return { 
      error: true, 
      message: error.message || "Error interno del servidor" 
    };
  }
}

// =====================================================
// ACTIONS PARA BOOKMARKS (GUARDAR POSTS)
// =====================================================

/**
 * Alternar bookmark de un post (guardar o quitar de guardados)
 * 
 * Similar a toggleLike pero para bookmarks/posts guardados
 * 
 * @param {Object} prevState - Estado anterior
 * @param {FormData} formData - Datos con post_id
 * @returns {Object} Resultado de la operación
 */
export async function toggleBookmark(prevState, formData) {
  try {
    const supabase = await createServerSupabaseAction();
    
    // 1. Verificar autenticación
    const session = await requireAuth(supabase);
    const userId = session.user.id;
    
    // 2. Validar post_id
    const postId = validatePostId(formData.get("post_id"));
    
    // 3. Verificar si el post existe
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", postId)
      .single();
      
    if (postError || !post) {
      return { 
        error: true, 
        message: "Post no encontrado" 
      };
    }
    
    // 4. Buscar bookmark existente
    const { data: existingBookmark, error: bookmarkError } = await supabase
      .from("post_bookmarks")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", userId)
      .single();
    
    // 5. Alternar bookmark
    if (existingBookmark) {
      // Ya está guardado -> quitarlo
      const { error: deleteError } = await supabase
        .from("post_bookmarks")
        .delete()
        .eq("id", existingBookmark.id);
        
      if (deleteError) {
        return { 
          error: true, 
          message: "Error al quitar bookmark" 
        };
      }
    } else {
      // No está guardado -> guardarlo
      const { error: insertError } = await supabase
        .from("post_bookmarks")
        .insert({
          post_id: postId,
          user_id: userId
        });
        
      if (insertError) {
        return { 
          error: true, 
          message: "Error al guardar post" 
        };
      }
    }
    
    // 6. Revalidar página
    revalidatePath("/feed");
    
    return { 
      error: false, 
      message: existingBookmark ? "Post removido de guardados" : "Post guardado",
      action: existingBookmark ? "unbookmarked" : "bookmarked"
    };
    
  } catch (error) {
    console.error("Error en toggleBookmark:", error);
    return { 
      error: true, 
      message: error.message || "Error interno del servidor" 
    };
  }
}

/**
 * Crear un comentario en un post
 * 
 * NOTA: Esta función está preparada para cuando implementes el sistema de comentarios
 * 
 * @param {Object} prevState - Estado anterior
 * @param {FormData} formData - Datos con post_id y content
 * @returns {Object} Resultado de la operación
 */
export async function createComment(prevState, formData) {
  try {
    const supabase = await createServerSupabaseAction();
    
    // 1. Verificar autenticación
    const session = await requireAuth(supabase);
    const userId = session.user.id;
    
    // 2. Validar datos
    const postId = validatePostId(formData.get("post_id"));
    const content = formData.get("content")?.toString().trim();
    
    if (!content || content.length < 1) {
      return {
        error: true,
        message: "El comentario no puede estar vacío"
      };
    }
    
    if (content.length > 500) {
      return {
        error: true,
        message: "El comentario es demasiado largo (máximo 500 caracteres)"
      };
    }
    
    // 3. Verificar que el post existe
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id")
      .eq("id", postId)
      .single();
      
    if (postError || !post) {
      return { 
        error: true, 
        message: "Post no encontrado" 
      };
    }
    
    // 4. Crear el comentario
    const { error: insertError } = await supabase
      .from("post_comments")
      .insert({
        post_id: postId,
        user_id: userId,
        content: content
      });
      
    if (insertError) {
      return {
        error: true,
        message: "Error al crear comentario"
      };
    }
    
    // 5. Revalidar página
    revalidatePath("/feed");
    
    return {
      error: false,
      message: "Comentario agregado"
    };
    
  } catch (error) {
    console.error("Error en createComment:", error);
    return {
      error: true,
      message: error.message || "Error interno del servidor"
    };
  }
}

// =====================================================
// ACTIONS PARA REPORTAR POSTS (MODERACIÓN)
// =====================================================

/**
 * Reportar un post por contenido inapropiado
 * 
 * @param {Object} prevState - Estado anterior
 * @param {FormData} formData - Datos con post_id y reason
 * @returns {Object} Resultado de la operación
 */
export async function reportPost(prevState, formData) {
  try {
    const supabase = await createServerSupabaseAction();
    
    // 1. Verificar autenticación
    const session = await requireAuth(supabase);
    const userId = session.user.id;
    
    // 2. Validar datos
    const postId = validatePostId(formData.get("post_id"));
    const reason = formData.get("reason")?.toString().trim();
    
    if (!reason) {
      return {
        error: true,
        message: "Debe especificar un motivo para el reporte"
      };
    }
    
    // 3. Verificar que el post existe
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, author_id")
      .eq("id", postId)
      .single();
      
    if (postError || !post) {
      return { 
        error: true, 
        message: "Post no encontrado" 
      };
    }
    
    // 4. No permitir reportar posts propios
    if (post.author_id === userId) {
      return {
        error: true,
        message: "No puedes reportar tus propios posts"
      };
    }
    
    // 5. Verificar si ya reportó este post
    const { data: existingReport } = await supabase
      .from("post_reports")
      .select("id")
      .eq("post_id", postId)
      .eq("reporter_id", userId)
      .single();
      
    if (existingReport) {
      return {
        error: true,
        message: "Ya has reportado este post"
      };
    }
    
    // 6. Crear el reporte
    const { error: insertError } = await supabase
      .from("post_reports")
      .insert({
        post_id: postId,
        reporter_id: userId,
        reason: reason
      });
      
    if (insertError) {
      return {
        error: true,
        message: "Error al enviar reporte"
      };
    }
    
    return {
      error: false,
      message: "Reporte enviado. Será revisado por moderadores."
    };
    
  } catch (error) {
    console.error("Error en reportPost:", error);
    return {
      error: true,
      message: error.message || "Error interno del servidor"
    };
  }
}