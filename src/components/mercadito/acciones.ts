import { useState } from "react";
import { toast } from "sonner";

import { useApp } from "@/components/app/contexto";
import { alternarGuardado, useMercaditoLocal } from "@/estado/mercadito";
import type { Articulo } from "@/datos/tipos";

/** Acciones compartidas por la tarjeta y la página de detalle. */
export function useAccionesArticulo(articulo: Articulo) {
  const { requiereCuenta } = useApp();
  const local = useMercaditoLocal();
  const [contactoAbierto, setContactoAbierto] = useState(false);
  const [denunciaAbierta, setDenunciaAbierta] = useState(false);
  const [denunciado, setDenunciado] = useState(false);

  const guardado = local.guardados.includes(articulo.id);

  const guardar = () => {
    if (!requiereCuenta()) return;
    const ahora = alternarGuardado(articulo.id);
    toast.success(ahora ? "Guardado en tus artículos" : "Lo quitamos de guardados");
  };

  const compartir = async () => {
    const url = `${window.location.origin}/producto/${articulo.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Copiamos el enlace del anuncio");
    } catch {
      toast.info(url);
    }
  };

  const contactar = () => {
    if (!requiereCuenta()) return;
    setContactoAbierto(true);
  };

  const denunciar = () => {
    if (!requiereCuenta()) return;
    setDenunciaAbierta(true);
  };

  const confirmarDenuncia = (motivo: string) => {
    setDenunciado(true);
    toast.success(`Denuncia simulada enviada: ${motivo}`, {
      description: "Puedes deshacerla durante unos segundos.",
      action: { label: "Deshacer", onClick: () => setDenunciado(false) },
      duration: 8000,
    });
  };

  return {
    guardado,
    guardar,
    compartir,
    contactar,
    denunciar,
    confirmarDenuncia,
    contactoAbierto,
    setContactoAbierto,
    denunciaAbierta,
    setDenunciaAbierta,
    denunciado,
    setDenunciado,
  };
}
