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
// ---------------------------------------------------------------------------
// El Mercadito
// ---------------------------------------------------------------------------

import { ARTICULOS } from "./demo/mercadito";
import type { Articulo, EstadoAnuncio, ModoArticulo } from "./tipos";

export type OrdenMercadito = "recientes" | "precio-asc" | "precio-desc" | "valorados";
export type QuienAnuncia = "todos" | "personas" | "negocios" | "verificados";

export type FiltrosMercadito = {
  texto: string;
  modo: "todas" | ModoArticulo;
  categoria: string;
  pais: string;
  zona: string;
  precioMin: string;
  precioMax: string;
  estado: string;
  quien: QuienAnuncia;
  orden: OrdenMercadito;
};

export const FILTROS_MERCADITO_INICIALES: FiltrosMercadito = {
  texto: "",
  modo: "todas",
  categoria: "todas",
  pais: "todos",
  zona: "todas",
  precioMin: "",
  precioMax: "",
  estado: "todos",
  quien: "todos",
  orden: "recientes",
};

function normalizar(valor: string) {
  return valor
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function filtrarArticulos(lista: Articulo[], f: FiltrosMercadito) {
  const texto = normalizar(f.texto.trim());
  const min = f.precioMin ? Number(f.precioMin) : undefined;
  const max = f.precioMax ? Number(f.precioMax) : undefined;

  const resultado = lista.filter((a) => {
    if (a.estadoAnuncio === "borrador" || a.estadoAnuncio === "retirado") return false;
    if (texto) {
      const campo = normalizar(
        `${a.titulo} ${a.descripcion} ${a.categoria} ${a.zona} ${a.vendedor.nombreVisible}`,
      );
      if (!campo.includes(texto)) return false;
    }
    if (f.modo !== "todas" && a.modo !== f.modo) return false;
    if (f.categoria !== "todas" && a.categoria !== f.categoria) return false;
    if (f.pais !== "todos" && a.pais !== f.pais) return false;
    if (f.zona !== "todas" && a.zona !== f.zona) return false;
    if (f.estado !== "todos" && a.estado !== f.estado) return false;
    if (f.quien === "personas" && a.vendedor.tipo === "negocio") return false;
    if (f.quien === "negocios" && a.vendedor.tipo !== "negocio") return false;
    if (f.quien === "verificados" && !a.vendedor.verificado) return false;
    if (min !== undefined && !Number.isNaN(min)) {
      if (a.precio === undefined || a.precio < min) return false;
    }
    if (max !== undefined && !Number.isNaN(max)) {
      if (a.precio === undefined || a.precio > max) return false;
    }
    return true;
  });

  const orden = [...resultado];
  switch (f.orden) {
    case "precio-asc":
      orden.sort((a, b) => (a.precio ?? Infinity) - (b.precio ?? Infinity));
      break;
    case "precio-desc":
      orden.sort((a, b) => (b.precio ?? -Infinity) - (a.precio ?? -Infinity));
      break;
    case "valorados":
      orden.sort((a, b) => b.vendedor.reputacion - a.vendedor.reputacion);
      break;
    default:
      break;
  }
  return orden;
}

export type OpcionesCatalogo = {
  filtros: FiltrosMercadito;
  adicionales?: Articulo[];
  estados?: Record<string, EstadoAnuncio>;
  eliminados?: string[];
  forzarError?: boolean;
};

export function componerCatalogo({
  adicionales = [],
  estados = {},
  eliminados = [],
}: {
  adicionales?: Articulo[];
  estados?: Record<string, EstadoAnuncio>;
  eliminados?: string[];
}) {
  return [...adicionales, ...ARTICULOS]
    .filter((a) => !eliminados.includes(a.id))
    .map((a) => (estados[a.id] ? { ...a, estadoAnuncio: estados[a.id]! } : a));
}

export async function obtenerArticulos({
  filtros,
  adicionales,
  estados,
  eliminados,
  forzarError,
}: OpcionesCatalogo): Promise<Articulo[]> {
  if (MODO_DEMO) await esperar(RETARDO_SIMULADO_MS);
  if (forzarError) {
    throw new Error("No pudimos cargar El Mercadito. Inténtalo otra vez.");
  }
  const base = componerCatalogo({
    ...(adicionales ? { adicionales } : {}),
    ...(estados ? { estados } : {}),
    ...(eliminados ? { eliminados } : {}),
  });
  return filtrarArticulos(base, filtros);
}

export function articulosSimilares(articulo: Articulo, lista: Articulo[], limite = 3) {
  return lista
    .filter((a) => a.id !== articulo.id)
    .filter((a) => a.categoria === articulo.categoria || a.modo === articulo.modo)
    .slice(0, limite);
}
