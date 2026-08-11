import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

import { MarcoApp } from "@/components/app/MarcoApp";
import { PaginaEnPreparacion } from "@/components/app/PaginaEnPreparacion";
import { NEGOCIOS } from "@/datos/demo/colmena";

export const Route = createFileRoute("/colmena")({
  head: () => ({
    meta: [
      { title: "La Colmena — La Chivichana" },
      { name: "description", content: "Negocios, profesionales y colaboraciones que abren caminos." },
      { property: "og:title", content: "La Colmena — La Chivichana" },
      { property: "og:description", content: "Negocios, profesionales y colaboraciones que abren caminos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ColmenaPage,
});

function ColmenaPage() {
  const vistaPrevia = NEGOCIOS.slice(0, 3).map((n) => ({ titulo: n.nombre, detalle: `${n.sector} · ${n.area}` }));

  return (
    <MarcoApp>
      <PaginaEnPreparacion
        nombre="La Colmena"
        icono={Users}
        descripcion="Negocios, profesionales y colaboraciones que abren caminos."
        vistaPrevia={vistaPrevia}
      />
    </MarcoApp>
  );
}
