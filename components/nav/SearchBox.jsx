"use client";

export default function SearchBox({query, setQuery, onSubmit, className = "",}) {
  return (
    <form onSubmit={onSubmit} className="w-full">
      <div className={`w-full flex items-center gap-2 border border-border rounded-full px-3 py-1.5 bg-background ${className}`}>
        <input
          aria-label="Buscar"
          type="search"
          placeholder="Buscar personas, publicaciones o comunidades..."
          className="min-w-0 flex-1 bg-transparent outline-none text-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="submit"
          className="px-3 py-1.5 rounded-full bg-brand text-brand-foreground text-sm font-medium hover:opacity-90 whitespace-nowrap"
        >
          Buscar
        </button>
      </div>
    </form> 
  );
}
