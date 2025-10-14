"use client";
/**
 * Selector de idioma controlado por el padre.
 * Props:
 *  - value: string ("es" | "en")
 *  - onChange: (next: string) => void
 */
export default function LangSwitcher({ value = "es", onChange = () => {} }) {
    return (
    <>
      <label className="sr-only" htmlFor="lang">Idioma</label>
      <select
        id="lang"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-border rounded-md bg-background px-2 py-1 text-sm"
      >
        <option value="es">ES</option>
        <option value="en">EN</option>
      </select>
    </>
  );
}