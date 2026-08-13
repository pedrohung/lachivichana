import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck } from "lucide-react";

import { MarcoApp } from "@/components/app/MarcoApp";
import { PaginaEnPreparacion } from "@/components/app/PaginaEnPreparacion";
import { PROMOTORES, TIPOS_PROMOTOR } from "@/datos/demo/promotores";

export const Route = createFileRoute("/promotores")({
  head: () => ({
    meta: [
      { title: "Los Promotores — La Chivichana" },
      {
        name: "description",
        content: "La red acreditada que verifica, acompaña y entrega la ayuda.",
      },
      { property: "og:title", content: "Los Promotores — La Chivichana" },
      {
        property: "og:description",
        content: "La red acreditada que verifica, acompaña y entrega la ayuda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PromotoresPage,
});

function PromotoresPage() {
  const vistaPrevia = PROMOTORES.slice(0, 3).map((p) => ({
    titulo: p.nombrePublico,
    detalle: `${TIPOS_PROMOTOR[p.tipo]} · ${p.zona} · ${p.ayudasCompletadas} ayudas`,
  }));

  return (
    <MarcoApp>
      <PaginaEnPreparacion
        nombre="Los Promotores"
        icono={BadgeCheck}
        descripcion="La red acreditada que verifica, acompaña y entrega la ayuda."
        vistaPrevia={vistaPrevia}
      />
    </MarcoApp>
  );
}
