"use client";
import { useState, useEffect, useRef } from "react";
import { quickSearchUsers } from "@/app/search/searchActions";
import SearchDropdown from "@/components/search/SearchDropdown";

/**
 * ============================================================================
 * BUSCADOR CON AUTOCOMPLETADO EN TIEMPO REAL
 * ============================================================================
 *
 * Componente que maneja el input de búsqueda y el dropdown de resultados.
 *
 * FUNCIONALIDADES:
 * - Input controlado (valor sincronizado con prop query)
 * - Búsqueda con debounce (espera 300ms después de que el usuario deja de escribir)
 * - Dropdown flotante con resultados en tiempo real
 * - Cierra dropdown al hacer clic fuera
 * - Envía búsqueda completa al presionar Enter o botón "Buscar"
 *
 * FLUJO:
 * 1. Usuario escribe en input
 * 2. setQuery actualiza el estado en NavbarClient
 * 3. useEffect detecta cambio en query
 * 4. Espera 300ms (debounce) para evitar búsquedas excesivas
 * 5. Llama a quickSearchUsers (Server Action)
 * 6. Actualiza searchResults con los usuarios encontrados
 * 7. Muestra SearchDropdown con los resultados
 * 8. Si usuario presiona Enter o "Buscar", ejecuta onSubmit (navega a /search?q=...)
 *
 * @param {string} query - Texto actual del buscador (estado controlado desde NavbarClient)
 * @param {Function} setQuery - Función para actualizar el query
 * @param {Function} onSubmit - Función que se ejecuta al enviar el formulario (buscar completo)
 * @param {string} className - Clases CSS adicionales
 */

export default function SearchBox({
  query,
  setQuery,
  onSubmit,
  className = "",
}) {
  //1. Estado local del componente
  //Controla si el dropdown está abierto o cerrado
  const [showDropdown, setShowDropdown] = useState(false);

  // Array de usuarios retornados por quickSearchUsers
  // Cada objeto tiene: {id, username, full_name, avatar_url, relationship}
  const [searchResults, setSearchResults] = useState([]);

  // Indica si hay una búsqueda en proceso
  // true = mostrará "Buscando..." en dropdown
  const [isSearching, setIsSearching] = useState(false);

  //2. Referencias para detectar clics fuera del componente
  const containerRef = useRef(null); //Referencia al contenedor principal
  const timeoutRef = useRef(null); //Referencia al timeout del debounce

  //3. Efecto para manejar búsqueda con debounce
  /**
   * DEBOUNCE: Espera X milisegundos de inactividad antes de ejecutar la acción.
   * Ejemplo: Usuario escribe "daniel"
   * - Tecla "d" → cancela búsqueda anterior, espera 300ms
   * - Tecla "a" → cancela búsqueda anterior, espera 300ms
   * - Tecla "n" → cancela búsqueda anterior, espera 300ms
   * - Tecla "i" → cancela búsqueda anterior, espera 300ms
   * - Tecla "e" → cancela búsqueda anterior, espera 300ms
   * - Tecla "l" → cancela búsqueda anterior, espera 300ms
   * - Usuario para de escribir → después de 300ms ejecuta búsqueda
   *
   * Resultado: 1 búsqueda en lugar de 6
   */
  useEffect(() => {
    // 3.1: Limpiar timeout anterior si existe
    // Si el usuario sigue escribiendo, cancelamos la búsqueda pendiente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // 3.2: Validar longitud mínima del query
    // Si el query es muy corto (< 2 caracteres), limpiar resultados y ocultar dropdown
    if (!query || query.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return; // Salir del efecto sin crear nuevo timeout
    }

    // 3.3: Crear nuevo timeout para búsqueda
    // setTimeout retorna un ID que guardamos en timeoutRef.current
    // Este ID se usa para cancelar el timeout si es necesario
    timeoutRef.current = setTimeout(async () => {
      // Indicar que la búsqueda está en proceso
      setIsSearching(true);

      // Llamar a la Server Action
      // quickSearchUsers retorna: {ok: boolean, users: Array, message?: string}
      const result = await quickSearchUsers(query);

      // Si la búsqueda fue exitosa, actualizar resultados y mostrar dropdown
      if (result.ok) {
        setSearchResults(result.users);
        setShowDropdown(true);
      }

      // Búsqueda terminada
      setIsSearching(false);
    }, 300); // 300ms de espera

    // 3.4: Cleanup function
    // Esta función se ejecuta ANTES del próximo efecto o al desmontar el componente
    // Limpia el timeout para evitar memory leaks
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query]); // Dependencia: se ejecuta cada vez que 'query' cambia

  // 4. EFECTO: CERRAR DROPDOWN AL HACER CLICK FUERA
  useEffect(() => {
    function handleClickOutside(event) {
      // containerRef.current es el div contenedor del SearchBox
      // event.target es el elemento donde se hizo click
      // contains() verifica si event.target está dentro de containerRef
      // Si NO está dentro (!contains), significa que el click fue fuera
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }

    // 4.2: Añadir event listener solo si el dropdown está abierto
    // Optimización: no escuchamos clicks si el dropdown está cerrado
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);

      // Cleanup: remover event listener al cerrar dropdown o desmontar
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showDropdown]); // Dependencia: se ejecuta cuando showDropdown cambia

  // 5. HANDLERS DE EVENTOS
  // Maneja el envío del formulario (Enter o botón "Buscar")
  // Cierra el dropdown, ejecuta onSubmit (pasado desde NavbarClient) y onSubmit navega a /search?q=...

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowDropdown(false); // Cierra dropdown
    onSubmit(e); // Ejecuta la función del padre (navega a /search)
  };
  // Cierra el dropdown
  const handleCloseDropdown = () => {
    setShowDropdown(false);
  };

  //6. Renderizado del componente
  return (
    // Contenedor con position relative que permite que SearchDropdown (position: absolute) se posicione relativo a este div
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="w-full flex items-center gap-2 border border-border rounded-full px-3 py-1.5 bg-background">
          {/* INPUT DE BÚSQUEDA */}
          <input
            aria-label="Buscar"
            type="search"
            placeholder="Buscar personas, publicaciones o comunidades..."
            className="min-w-0 flex-1 bg-transparent outline-none text-sm"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              // Al hacer focus en el input, si ya hay resultados, mostrar dropdown
              // Caso de uso: usuario cierra dropdown sin navegar, vuelve a hacer click en input
              if (query.trim().length >= 2 && searchResults.length > 0) {
                setShowDropdown(true);
              }
            }}
          />
          {/* BOTÓN "BUSCAR" */}
          <button
            type="submit"
            className="px-3 py-1.5 rounded-full bg-brand text-brand-foreground text-sm font-medium hover:opacity-90 whitespace-nowrap"
          >
            Buscar
          </button>
        </div>
      </form>

      {/* DROPDOWN DE RESULTADOS */}
      {showDropdown && (
        <SearchDropdown
          users={searchResults}        // Array de usuarios encontrados
          query={query}                // Texto buscado (para mostrar en "Ver todos los resultados para X")
          onClose={handleCloseDropdown} // Función para cerrar dropdown
          isLoading={isSearching}      // Estado de carga
        />
      )}
    </div>
  );
}
