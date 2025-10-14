"use client";
import Link from "next/link";
import UserSearchCard from "./UserSearchCard";

/**
 * DROPDOWN DE RESULTADOS DE BÚSQUEDA
 * 
 * Componente que renderiza el dropdown flotante con los resultados de búsqueda.
 * Se posiciona absolutamente debajo del SearchBox.
 * 
 * RESPONSABILIDADES:
 * - Renderizar el contenedor visual del dropdown (caja flotante)
 * - Manejar estados: loading, sin resultados, con resultados
 * - Iterar sobre el array de usuarios y renderizar UserSearchCard para cada uno
 * - Mostrar link "Ver todos los resultados" al final
 * - Cerrar dropdown cuando el usuario navega
 * 
 * ESTADOS POSIBLES:
 * 1. query < 2 caracteres → No renderiza nada (return null)
 * 2. isLoading === true → "Buscando..."
 * 3. users.length === 0 → "No se encontraron usuarios"
 * 4. users.length > 0 → Lista de UserSearchCard + link
 * 
 * @param {Array} users - Array de usuarios con sus datos y relationship
 * @param {string} query - Texto que el usuario está buscando
 * @param {Function} onClose - Callback para cerrar el dropdown
 * @param {boolean} isLoading - Indica si se está ejecutando la búsqueda
 */

export default function SearchDropdown({ users, query, onClose, isLoading }) {
  // 1. VALIDACIÓN INICIAL
  // Si el query es muy corto (< 2 caracteres), no mostramos el dropdown
  // Esto evita renderizar un dropdown vacío cuando el usuario apenas empieza a escribir
  if (!query || query.trim().length < 2) {
    return null;
  }

  // 2. RENDERIZADO DEL DROPDOWN
  return (
    // Contenedor principal del dropdown
    // POSICIONAMIENTO:
    // - absolute: se posiciona relativo al padre (SearchBox tiene position: relative)
    // - top-full: se coloca justo debajo del SearchBox (top: 100%)
    // - left-0 right-0: ocupa todo el ancho del SearchBox
    // - mt-2: margen superior de 0.5rem (8px) para separarlo del input
    //
    // ESTILO:
    // - bg-background: color de fondo según el tema
    // - border border-border: borde sutil
    // - rounded-xl: bordes redondeados (12px)
    // - shadow-lg: sombra grande para efecto flotante
    // - overflow-hidden: esconde contenido que se salga (para border-radius limpio)
    // - z-50: z-index alto para que aparezca sobre otros elementos
    <div className="absolute top-full left-0 right-0 mt-2 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-30">
      {/* ESTADO 1: LOADING - Búsqueda en proceso */}
      {isLoading ? (
        // Mensaje centrado mientras se busca
        // py-8: padding vertical generoso (2rem = 32px)
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          Buscando...
        </div>
      
      // ESTADO 2: SIN RESULTADOS - La búsqueda no encontró usuarios
      ) : users.length === 0 ? (
        // Mensaje centrado cuando no hay resultados
        // Mismos estilos que loading para consistencia visual
        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
          No se encontraron usuarios
        </div>
      
      // ESTADO 3: CON RESULTADOS - Mostrar lista de usuarios
      ) : (
        <>
          {/* 3.1: Lista de usuarios */}
          {/* 
            divide-y divide-border: 
            - Añade bordes horizontales entre cada hijo
            - Crea separadores visuales sin afectar el padding de cada card
            - Los bordes solo aparecen ENTRE elementos, no antes del primero ni después del último
          */}
          <div className="divide-y divide-border">
            {/* Iteramos sobre el array de usuarios.*/}
            {users.map((user) => (
              // key={user.id}: React necesita una key única para optimizar re-renders
              // Pasamos el objeto user completo y la función onClose
              <UserSearchCard 
                key={user.id} 
                user={user} 
                onClose={onClose} 
              />
            ))}
          </div>

          {/* 3.2: Link "Ver todos los resultados"*/}
          {/*
            Este link aparece al final del dropdown y permite al usuario
            navegar a la página completa de resultados (/search?q=...)
            
            COMPORTAMIENTO:
            - Click → navega a /search con query como parámetro
            - onClick={onClose} → cierra el dropdown al navegar
            - Usa encodeURIComponent() para escapar caracteres especiales en el query
              Ejemplo: "maría josé" → "mar%C3%ADa%20jos%C3%A9"
          */}
          <Link
            href={`/search?q=${encodeURIComponent(query)}`}
            onClick={onClose}
            // ESTILOS:
            // - block: display block para ocupar todo el ancho
            // - px-4 py-3: padding interno (izq/der: 1rem, arr/aba: 0.75rem)
            // - text-center: texto centrado
            // - text-sm: tamaño de fuente pequeño (14px)
            // - text-blue-600: color azul del link
            // - hover:bg-accent: fondo gris claro al pasar el mouse
            // - border-t border-border: borde superior para separarlo de la lista
            // - font-medium: peso de fuente medio (500)
            // - transition-colors: animación suave del color de fondo
            className="block px-4 py-3 text-center text-sm text-blue-600 hover:bg-accent border-t border-border font-medium transition-colors"
          >
            {/* 
              &quot; es la entidad HTML para comillas dobles (")
              Next.js lo requiere para evitar problemas de escapado en JSX
              
              Resultado visual: Ver todos los resultados para "daniel"
            */}
            Ver todos los resultados para &quot;{query}&quot;
          </Link>
        </>
      )}
    </div>
  );
}