// Cliente de PocketBase (singleton perezoso).
//
// TanStack Start también renderiza en el servidor, donde no existe
// `localStorage` (el SDK guarda ahí la sesión por defecto). Por eso el
// cliente solo se crea en el navegador (`typeof window !== "undefined"`) y
// esta función devuelve `null` en el servidor: la autenticación es una
// responsabilidad exclusiva del cliente y el SSR la ignora sin romperse.

import PocketBase from "pocketbase";

let instancia: PocketBase | null = null;

/** URL base de PocketBase. Por defecto "/pb" (proxy del despliegue). */
function leerUrl(): string {
  const deEntorno = import.meta.env.VITE_POCKETBASE_URL;
  return typeof deEntorno === "string" && deEntorno.length > 0 ? deEntorno : "/pb";
}

/**
 * Devuelve el cliente PocketBase compartido, o `null` durante el
 * renderizado en servidor (SSR), donde no hay almacenamiento local.
 */
export function obtenerPocketBase(): PocketBase | null {
  if (typeof window === "undefined") return null;
  if (!instancia) instancia = new PocketBase(leerUrl());
  return instancia;
}

/**
 * Patrón de alias válido en PocketBase:
 * letras, números, guion, guion bajo y punto.
 */
export const PATRON_ALIAS = /^[A-Za-z0-9._-]+$/;

/** Registro de la colección auth `users` de PocketBase. */
export interface Usuario {
  id: string;
  email: string;
  username: string;
  accountType?: string;
  name?: string;
  avatar?: string;
  emailVisibility?: boolean;
  verified?: boolean;
  created?: string;
  updated?: string;
}

/** Registro de la colección `profiles` de PocketBase. */
export interface Perfil {
  id: string;
  user: string;
  alias: string;
  bio?: string;
  avatar?: string;
  cover?: string;
  location?: string;
  website?: string;
  verified?: boolean;
  accountType?: string;
  created?: string;
  updated?: string;
}
