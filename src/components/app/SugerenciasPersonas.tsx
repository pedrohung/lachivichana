import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { buscarPersonasPorAlias, type PerfilBusqueda } from "@/datos/servicios";

/** Desplegable Personas bajo el buscador global: avatar + alias, clic -> perfil. */
export default function SugerenciasPersonas({ texto, alElegir }: { texto: string; alElegir: () => void }) {
  const navegar = useNavigate();
  const [personas, setPersonas] = useState<PerfilBusqueda[]>([]);
  const [abierto, setAbierto] = useState(false);
  const temporizador = useRef<number | null>(null);

  useEffect(() => {
    const q = texto.trim();
    if (temporizador.current) window.clearTimeout(temporizador.current);
    if (q.length < 2) { setPersonas([]); setAbierto(false); return; }
    temporizador.current = window.setTimeout(async () => {
      const lista = await buscarPersonasPorAlias(q);
      setPersonas(lista);
      setAbierto(true);
    }, 300);
    return () => { if (temporizador.current) window.clearTimeout(temporizador.current); };
  }, [texto]);

  if (!abierto || personas.length === 0) return null;
  return (
    <div className="absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border bg-fondo shadow-xl">
      <p className="px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Personas</p>
      <ul className="pb-2">
        {personas.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-2 text-left hover:bg-muted"
              onClick={() => { setAbierto(false); alElegir(); navegar({ to: "/perfil/$alias", params: { alias: p.alias } }); }}
            >
              {p.avatarUrl ? (
                <img src={p.avatarUrl} alt={"Avatar de " + p.alias} className="h-9 w-9 rounded-full object-cover" />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-bold">
                  {p.alias.slice(0, 1).toUpperCase()}
                </span>
              )}
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold">@{p.alias}</span>
                {p.bio ? <span className="block truncate text-xs text-muted-foreground">{p.bio}</span> : null}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
