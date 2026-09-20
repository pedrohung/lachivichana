// Estado de sesión con autenticación real contra PocketBase.
//
// La simulación anterior desaparece: "demo" pasa a significar "usuaria
// autenticada" y "visitante" "sin sesión". Se conservan `ModoSesion`,
// `establecerModo` y `useModoSesion` por compatibilidad con los
// consumidores actuales (p. ej. `ProveedorApp` en `contexto.tsx`).

import { useCallback, useSyncExternalStore } from "react";
import { obtenerPocketBase, type Perfil, type Usuario } from "@/lib/pocketbase";

export type ModoSesion = "visitante" | "demo";

export interface DatosRegistro {
  alias: string;
  correo: string;
  contrasena: string;
  /** Valor del select `accountType` ("persona" | "negocio"). Por defecto "persona". */
  tipoDeCuenta?: string;
}

interface EstadoSesion {
  usuario: Usuario | null;
  perfil: Perfil | null;
  cargando: boolean;
}

const oyentes = new Set<() => void>();

// Sin sesión hasta que el cliente hidrate el authStore (solo en navegador).
let estado: EstadoSesion = { usuario: null, perfil: null, cargando: true };
let escuchaActiva = false;

function avisar() {
  for (const oyente of oyentes) oyente();
}

function fijarEstado(parcial: Partial<EstadoSesion>) {
  estado = { ...estado, ...parcial };
  avisar();
}

async function cargarPerfil(idUsuario: string): Promise<Perfil | null> {
  const pb = obtenerPocketBase();
  if (!pb) return null;
  try {
    return await pb.collection("profiles").getFirstListItem<Perfil>(`user = "${idUsuario}"`);
  } catch {
    return null;
  }
}

/** Sincroniza el estado con el authStore, fuente de verdad de la sesión. */
function sincronizar() {
  const pb = obtenerPocketBase();
  const modelo = pb?.authStore.model;
  if (!pb || !pb.authStore.isValid || !modelo) {
    fijarEstado({ usuario: null, perfil: null, cargando: false });
    return;
  }
  const usuario = modelo as unknown as Usuario;
  fijarEstado({ usuario, perfil: null, cargando: true });
  void cargarPerfil(usuario.id).then((perfil) => {
    // Evita que una respuesta tardía pise una sesión más reciente.
    if (obtenerPocketBase()?.authStore.model?.id === usuario.id) {
      fijarEstado({ perfil, cargando: false });
    }
  });
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente);
  if (!escuchaActiva) {
    escuchaActiva = true;
    const pb = obtenerPocketBase();
    if (pb) {
      pb.authStore.onChange(() => sincronizar());
      sincronizar();
    } else {
      // Servidor (SSR): no hay sesión que hidratar.
      fijarEstado({ cargando: false });
    }
  }
  return () => {
    oyentes.delete(oyente);
  };
}

function leerEstado() {
  return estado;
}

function mensajeDeError(error: unknown, contexto: "entrar" | "registrar"): string {
  const codigo = (error as { status?: number } | null | undefined)?.status;
  if (codigo === 400) {
    return contexto === "entrar"
      ? "No encontramos esa cuenta o la contraseña no coincide. Revisa tu correo o alias e inténtalo de nuevo."
      : "No pudimos crear tu cuenta. Revisa que el correo y el alias no estén en uso y que la contraseña tenga al menos 8 caracteres.";
  }
  if (typeof codigo === "number" && codigo >= 500) {
    return "El servidor no responde. Inténtalo de nuevo en unos minutos.";
  }
  return "Ocurrió un problema inesperado. Inténtalo de nuevo.";
}

/**
 * Inicia sesión con el correo o el alias y la contraseña.
 * Lanza un `Error` con mensaje legible si la autenticación falla.
 */
export async function entrar(identidad: string, contrasena: string): Promise<void> {
  const pb = obtenerPocketBase();
  if (!pb) throw new Error("La sesión solo está disponible en el navegador.");
  fijarEstado({ cargando: true });
  try {
    await pb.collection("users").authWithPassword(identidad.trim(), contrasena);
    sincronizar();
  } catch (error) {
    fijarEstado({ cargando: false });
    throw new Error(mensajeDeError(error, "entrar"));
  }
}

/**
 * Crea la cuenta en `users`, su perfil en `profiles` y deja la sesión iniciada.
 * Lanza un `Error` con mensaje legible si el registro falla.
 */
export async function registrar(datos: DatosRegistro): Promise<void> {
  const pb = obtenerPocketBase();
  if (!pb) throw new Error("El registro solo está disponible en el navegador.");
  const alias = datos.alias.trim();
  const correo = datos.correo.trim();
  const tipoDeCuenta = datos.tipoDeCuenta?.trim() || "persona";
  fijarEstado({ cargando: true });
  try {
    const creado = await pb.collection("users").create<Usuario>({
      email: correo,
      username: alias,
      password: datos.contrasena,
      passwordConfirm: datos.contrasena,
      accountType: tipoDeCuenta,
    });
    // La sesión debe iniciarse antes de crear el perfil: la regla de
    // `profiles` exige que `@request.auth.id` coincida con `user`.
    await pb.collection("users").authWithPassword(correo, datos.contrasena);
    await pb.collection("profiles").create({
      user: creado.id,
      alias,
      accountType: tipoDeCuenta,
    });
    sincronizar();
  } catch (error) {
    fijarEstado({ cargando: false });
    throw new Error(mensajeDeError(error, "registrar"));
  }
}

/** Cierra la sesión actual. */
export function salir(): void {
  obtenerPocketBase()?.authStore.clear();
  fijarEstado({ usuario: null, perfil: null, cargando: false });
}

/** Sesión real: usuaria, perfil, carga en curso y acciones. */
export function useSesion() {
  const { usuario, perfil, cargando } = useSyncExternalStore(suscribir, leerEstado, leerEstado);
  return { usuario, perfil, cargando, entrar, registrar, salir };
}

/**
 * Compatibilidad: "demo" = autenticada, "visitante" = sin sesión.
 * `cambiarModo("visitante")` cierra la sesión; pasar a "demo" sin
 * credenciales no tiene efecto (la simulación se eliminó).
 */
export function useModoSesion() {
  const { usuario, cargando } = useSyncExternalStore(suscribir, leerEstado, leerEstado);
  const cambiarModo = useCallback((modo: ModoSesion) => {
    if (modo === "visitante") salir();
  }, []);
  return {
    modo: (usuario ? "demo" : "visitante") as ModoSesion,
    invitado: usuario === null,
    cargando,
    cambiarModo,
  };
}

/**
 * Compatibilidad: solo "visitante" tiene efecto (cierra la sesión).
 * Pasar a "demo" sin credenciales no es posible con autenticación real.
 */
export function establecerModo(modo: ModoSesion): void {
  if (modo === "visitante") salir();
}
