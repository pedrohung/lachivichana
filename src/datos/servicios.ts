// Servicios simulados. Cuando exista backend, estas funciones
// llamarán a la API real sin cambiar la firma.

import { MODO_DEMO, RETARDO_SIMULADO_MS } from "./config";
import { PUBLICACIONES } from "./demo/publicaciones";
import type { FiltroMuro } from "./demo/publicaciones";
import type { Publicacion } from "./tipos";

function esperar(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

const TEMAS_POR_FILTRO: Partial<Record<FiltroMuro, string[]>> = {
  ayuda: ["Ayuda", "Salud"],
  emprendimiento: ["Emprendimiento", "Empleo"],
  opinion: ["Opinión"],
};

const ALIAS_SEGUIDOS = ["solarhabana", "manosdealtamar", "cafeconletras", "orillanorte"];

export function filtrarPublicaciones(lista: Publicacion[], filtro: FiltroMuro) {
  switch (filtro) {
    case "para-ti":
      return lista;
    case "siguiendo":
      return lista.filter((p) => ALIAS_SEGUIDOS.includes(p.autor.alias));
    case "cuba":
      return lista.filter((p) => Boolean(p.ubicacion));
    case "mi-comunidad":
      return lista.filter((p) => p.audiencia === "barrio" || p.audiencia === "conexiones");
    default: {
      const temas = TEMAS_POR_FILTRO[filtro] ?? [];
      return lista.filter((p) => p.temas.some((t) => temas.includes(t)));
    }
  }
}

export type OpcionesMuro = {
  filtro: FiltroMuro;
  /** Sólo para la demostración: fuerza un fallo recuperable. */
  forzarError?: boolean;
};

export async function obtenerPublicaciones({
  filtro,
  forzarError,
}: OpcionesMuro): Promise<Publicacion[]> {
  if (MODO_DEMO) await esperar(RETARDO_SIMULADO_MS);
  if (forzarError) {
    throw new Error("No pudimos cargar El Malecón. Inténtalo otra vez.");
  }
  return filtrarPublicaciones(PUBLICACIONES, filtro);
}