import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { useSesion, type ModoSesion } from "@/estado/sesion";
import type { IdentidadTipo, Insignia } from "@/datos/tipos";

/** Rutas que exigen una cuenta: en modo visitante abren el diálogo de acceso. */
export const RUTAS_PROTEGIDAS = [
  "/publicar",
  "/mi-chivichana",
  "/mis-caminos",
  "/mensajes",
  "/notificaciones",
  "/mercadito/publicar",
  "/mercadito/mis-publicaciones",
  "/mercadito/guardados",
];

export function esRutaProtegida(ruta: string) {
  return RUTAS_PROTEGIDAS.includes(ruta);
}

/**
 * Identidad visible con la que participa la usuaria.
 * Los usuarios de PocketBase no tienen foto: el avatar va vacío y el
 * componente `AvatarIniciales` muestra las iniciales del nombre visible.
 */
export type IdentidadVisible = {
  clave: string;
  tipo: IdentidadTipo;
  nombreVisible: string;
  avatar: string;
  detalle: string;
  insignias: Insignia[];
  enlace: string;
};

type ContextoApp = {
  /** Modo público: se puede leer, pero no interactuar. */
  invitado: boolean;
  modo: ModoSesion;
  identidad: IdentidadVisible;
  /** Compatibilidad: con cuentas reales solo hay una identidad activa. */
  identidades: IdentidadVisible[];
  /** Compatibilidad: ya no hay cambio de identidad; no tiene efecto. */
  cambiarIdentidad: (clave: string) => void;
  /** Devuelve true si la acción puede continuar. */
  requiereCuenta: () => boolean;
  dialogoAbierto: boolean;
  cerrarDialogo: () => void;
};

const Contexto = createContext<ContextoApp | null>(null);

function identidadDeVisita(): IdentidadVisible {
  return {
    clave: "visitante",
    tipo: "alias",
    nombreVisible: "Visitante",
    avatar: "",
    detalle: "Sin cuenta",
    insignias: [],
    enlace: "/registro",
  };
}

function identidadDeCuenta(usuario: {
  name?: string;
  username: string;
  verified?: boolean;
}): IdentidadVisible {
  const nombre = usuario.name?.trim() || usuario.username;
  return {
    clave: "cuenta",
    tipo: "alias",
    nombreVisible: nombre,
    avatar: "",
    detalle: `@${usuario.username}`,
    insignias: usuario.verified ? ["verificado"] : [],
    enlace: `/perfil/${usuario.username}`,
  };
}

export function ProveedorApp({
  modo: modoFijo,
  children,
}: {
  /** Si se indica, fija la modalidad de esta ruta ("visitante" fuerza vista de invitado). */
  modo?: ModoSesion | undefined;
  children: ReactNode;
}) {
  const { usuario, cargando } = useSesion();
  const [dialogoAbierto, setDialogoAbierto] = useState(false);

  // Autenticado solo cuando hay usuario y la sesión ya terminó de hidratarse.
  const autenticado = usuario !== null && !cargando;
  const modoActivo: ModoSesion = modoFijo ?? (autenticado ? "demo" : "visitante");
  const invitado = modoFijo === "visitante" ? true : !autenticado;

  // Al iniciar sesión cerramos cualquier diálogo de acceso abierto antes.
  useEffect(() => {
    if (!invitado) setDialogoAbierto(false);
  }, [invitado]);

  const identidad = useMemo<IdentidadVisible>(
    () => (usuario ? identidadDeCuenta(usuario) : identidadDeVisita()),
    [usuario],
  );

  const identidades = useMemo(() => [identidad], [identidad]);

  const cambiarIdentidad = useCallback((_clave: string) => {
    // Con autenticación real solo existe la identidad de la cuenta.
  }, []);

  const requiereCuenta = useCallback(() => {
    if (invitado) {
      setDialogoAbierto(true);
      return false;
    }
    return true;
  }, [invitado]);

  const valor = useMemo<ContextoApp>(
    () => ({
      invitado,
      modo: modoActivo,
      identidad,
      identidades,
      cambiarIdentidad,
      requiereCuenta,
      dialogoAbierto,
      cerrarDialogo: () => setDialogoAbierto(false),
    }),
    [
      invitado,
      modoActivo,
      identidad,
      identidades,
      cambiarIdentidad,
      requiereCuenta,
      dialogoAbierto,
    ],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useApp() {
  const valor = useContext(Contexto);
  if (!valor) throw new Error("useApp debe usarse dentro de ProveedorApp");
  return valor;
}
