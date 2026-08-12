// Estado de sesión simulada, centralizado en el frontend.
// No hay autenticación real ni datos sensibles: sólo la modalidad
// de la demostración (visitante o usuaria conectada de demostración).

import { useCallback, useSyncExternalStore } from "react";

export type ModoSesion = "visitante" | "demo";

const CLAVE = "chivichana:modo";

let modo: ModoSesion = "visitante";
let hidratado = false;
const oyentes = new Set<() => void>();

function leerAlmacen(): ModoSesion {
  if (typeof window === "undefined") return "visitante";
  try {
    return window.sessionStorage.getItem(CLAVE) === "demo" ? "demo" : "visitante";
  } catch {
    return "visitante";
  }
}

function avisar() {
  for (const o of oyentes) o();
}

function suscribir(oyente: () => void) {
  if (!hidratado) {
    hidratado = true;
    modo = leerAlmacen();
  }
  oyentes.add(oyente);
  return () => oyentes.delete(oyente);
}

export function establecerModo(nuevo: ModoSesion) {
  if (!hidratado) hidratado = true;
  if (modo === nuevo) return;
  modo = nuevo;
  try {
    window.sessionStorage.setItem(CLAVE, nuevo);
  } catch {
    /* la demostración funciona igual sin almacenamiento */
  }
  avisar();
}

/** Modalidad activa. Durante el SSR y la primera pintura devuelve "visitante". */
export function useModoSesion() {
  const valor = useSyncExternalStore(
    suscribir,
    () => modo,
    () => "visitante" as ModoSesion,
  );
  const cambiar = useCallback((nuevo: ModoSesion) => establecerModo(nuevo), []);
  return { modo: valor, invitado: valor !== "demo", cambiarModo: cambiar };
}
