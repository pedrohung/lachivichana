import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { IDENTIDADES, type IdentidadVisible } from "@/datos/demo/identidades";
import { establecerModo, useModoSesion, type ModoSesion } from "@/estado/sesion";

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

type ContextoApp = {
  /** Modo público: se puede leer, pero no interactuar. */
  invitado: boolean;
  modo: ModoSesion;
  identidad: IdentidadVisible;
  identidades: IdentidadVisible[];
  cambiarIdentidad: (clave: string) => void;
  /** Devuelve true si la acción puede continuar. */
  requiereCuenta: () => boolean;
  dialogoAbierto: boolean;
  cerrarDialogo: () => void;
};

const Contexto = createContext<ContextoApp | null>(null);

export function ProveedorApp({
  modo: modoFijo,
  children,
}: {
  /** Si se indica, esta ruta fija la modalidad de la demostración. */
  modo?: ModoSesion;
  children: ReactNode;
}) {
  const { modo } = useModoSesion();
  const [clave, setClave] = useState(IDENTIDADES[0]!.clave);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);

  useEffect(() => {
    if (modoFijo) establecerModo(modoFijo);
  }, [modoFijo]);

  const modoActivo = modoFijo ?? modo;
  const invitado = modoActivo !== "demo";

  const identidad = useMemo(
    () => IDENTIDADES.find((i) => i.clave === clave) ?? IDENTIDADES[0]!,
    [clave],
  );

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
      identidades: IDENTIDADES,
      cambiarIdentidad: setClave,
      requiereCuenta,
      dialogoAbierto,
      cerrarDialogo: () => setDialogoAbierto(false),
    }),
    [invitado, modoActivo, identidad, requiereCuenta, dialogoAbierto],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useApp() {
  const valor = useContext(Contexto);
  if (!valor) throw new Error("useApp debe usarse dentro de ProveedorApp");
  return valor;
}
