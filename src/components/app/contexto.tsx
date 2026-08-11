import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { IDENTIDADES, type IdentidadVisible } from "@/datos/demo/identidades";

type ContextoApp = {
  /** Modo público: se puede leer, pero no interactuar. */
  invitado: boolean;
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
  invitado,
  children,
}: {
  invitado: boolean;
  children: ReactNode;
}) {
  const [clave, setClave] = useState(IDENTIDADES[0]!.clave);
  const [dialogoAbierto, setDialogoAbierto] = useState(false);

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
      identidad,
      identidades: IDENTIDADES,
      cambiarIdentidad: setClave,
      requiereCuenta,
      dialogoAbierto,
      cerrarDialogo: () => setDialogoAbierto(false),
    }),
    [invitado, identidad, requiereCuenta, dialogoAbierto],
  );

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useApp() {
  const valor = useContext(Contexto);
  if (!valor) throw new Error("useApp debe usarse dentro de ProveedorApp");
  return valor;
}