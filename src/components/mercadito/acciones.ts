import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { useApp } from "@/components/app/contexto";
import { alternarFavorito, esFavorito } from "@/datos/servicios";
import type { Articulo } from "@/datos/tipos";

/** Acciones compartidas por la tarjeta y la página de detalle. */
export function useAccionesArticulo(
  articulo: Articulo,
  alCambiarFavorito?: (guardado: boolean) => void,
) {
  const { requiereCuenta } = useApp();
  const [contactoAbierto, setContactoAbierto] = useState(false);
  const [denunciaAbierta, setDenunciaAbierta] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    let vivo = true;
    void esFavorito("producto", articulo.id)
      .then((v) => {
        if (vivo) setGuardado(v);
      })
      .catch(() => {
        /* sin conexión o sin cuenta: se queda sin guardar */
      });
    return () => {
      vivo = false;
    };
  }, [articulo.id]);

  const guardar = useCallback(async () => {
    if (!requiereCuenta()) return;
    try {
      const { guardado: ahora } = await alternarFavorito("producto", articulo.id);
      setGuardado(ahora);
      alCambiarFavorito?.(ahora);
      toast.success(ahora ? "Guardado en tus artículos" : "Lo quitamos de guardados");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar el artículo");
    }
  }, [requiereCuenta, articulo.id, alCambiarFavorito]);

  const compartir = useCallback(async () => {
    const url = `${window.location.origin}/producto/${articulo.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Copiamos el enlace del anuncio");
    } catch {
      toast.info(url);
    }
  }, [articulo.id]);

  const contactar = useCallback(() => {
    if (!requiereCuenta()) return;
    setContactoAbierto(true);
  }, [requiereCuenta]);

  const denunciar = useCallback(() => {
    if (!requiereCuenta()) return;
    setDenunciaAbierta(true);
  }, [requiereCuenta]);

  return {
    guardado,
    guardar,
    compartir,
    contactar,
    denunciar,
    contactoAbierto,
    setContactoAbierto,
    denunciaAbierta,
    setDenunciaAbierta,
  };
}
