import { createFileRoute } from "@tanstack/react-router";
import { HandHeart } from "lucide-react";

import { MarcoApp } from "@/components/app/MarcoApp";
import { PaginaEnPreparacion } from "@/components/app/PaginaEnPreparacion";
import { CAMPANAS, ETIQUETA_ESTADO } from "@/datos/demo/mano";

export const Route = createFileRoute("/la-mano")({
  head: () => ({
    meta: [
      { title: "La Mano — La Chivichana" },
      { name: "description", content: "Campañas de ayuda con verificación, seguimiento y entrega justificada." },
      { property: "og:title", content: "La Mano — La Chivichana" },
      { property: "og:description", content: "Campañas de ayuda con verificación, seguimiento y entrega justificada." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LaManoPage,
});

function LaManoPage() {
  const vistaPrevia = CAMPANAS.slice(0, 3).map((c) => ({ titulo: c.titulo, detalle: `${ETIQUETA_ESTADO[c.estado]} · ${c.zona}` }));

  return (
    <MarcoApp>
      <PaginaEnPreparacion
        nombre="La Mano"
        icono={HandHeart}
        descripcion="Campañas de ayuda con verificación, seguimiento y entrega justificada."
        vistaPrevia={vistaPrevia}
      />
    </MarcoApp>
  );
}
