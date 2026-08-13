// Estado local del Mercadito para la demostración: artículos guardados,
// anuncios creados durante la sesión y cambios de estado simulados.
// Todo vive en memoria (y en sessionStorage) del navegador.

import { useSyncExternalStore } from "react";

import type { Articulo, EstadoAnuncio } from "@/datos/tipos";

type EstadoMercadito = {
  guardados: string[];
  creados: Articulo[];
  estados: Record<string, EstadoAnuncio>;
  eliminados: string[];
};

const CLAVE = "chivichana:mercadito";

let estado: EstadoMercadito = { guardados: [], creados: [], estados: {}, eliminados: [] };
let hidratado = false;
const oyentes = new Set<() => void>();

function leer(): EstadoMercadito {
  if (typeof window === "undefined")
    return { guardados: [], creados: [], estados: {}, eliminados: [] };
  try {
    const bruto = window.sessionStorage.getItem(CLAVE);
    if (!bruto) return { guardados: [], creados: [], estados: {}, eliminados: [] };
    const datos = JSON.parse(bruto) as Partial<EstadoMercadito>;
    return {
      guardados: datos.guardados ?? [],
      creados: datos.creados ?? [],
      estados: datos.estados ?? {},
      eliminados: datos.eliminados ?? [],
    };
  } catch {
    return { guardados: [], creados: [], estados: {}, eliminados: [] };
  }
}

function escribir(nuevo: EstadoMercadito) {
  estado = nuevo;
  try {
    window.sessionStorage.setItem(CLAVE, JSON.stringify(nuevo));
  } catch {
    /* opcional */
  }
  for (const o of oyentes) o();
}

function suscribir(oyente: () => void) {
  if (!hidratado) {
    hidratado = true;
    estado = leer();
  }
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

const VACIO: EstadoMercadito = { guardados: [], creados: [], estados: {}, eliminados: [] };

export function useMercaditoLocal() {
  return useSyncExternalStore(
    suscribir,
    () => estado,
    () => VACIO,
  );
}

export function alternarGuardado(id: string) {
  const guardados = estado.guardados.includes(id)
    ? estado.guardados.filter((g) => g !== id)
    : [...estado.guardados, id];
  escribir({ ...estado, guardados });
  return guardados.includes(id);
}

export function agregarAnuncio(articulo: Articulo) {
  escribir({ ...estado, creados: [articulo, ...estado.creados] });
}

export function cambiarEstadoAnuncio(id: string, nuevo: EstadoAnuncio) {
  escribir({ ...estado, estados: { ...estado.estados, [id]: nuevo } });
}

export function eliminarAnuncio(id: string) {
  escribir({ ...estado, eliminados: [...estado.eliminados, id] });
}

export function restaurarAnuncio(id: string) {
  escribir({ ...estado, eliminados: estado.eliminados.filter((e) => e !== id) });
}
