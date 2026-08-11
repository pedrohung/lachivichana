import { createFileRoute } from "@tanstack/react-router";
import { Route as RouteIcon } from "lucide-react";

import { MarcoApp } from "@/components/app/MarcoApp";
import { PaginaEnPreparacion } from "@/components/app/PaginaEnPreparacion";
import { CONEXIONES } from "@/datos/demo/barrios";

export const Route = createFileRoute("/mis-caminos")({
  head: () => ({
    meta: [
      { title: "Mis Caminos — La Chivichana" },
      { name: "description", content: "Conexiones, seguidores e invitaciones." },
      { property: "og:title", content: "Mis Caminos — La Chivichana" },
      { property: "og:description", content: "Conexiones, seguidores e invitaciones." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MisCaminosPage,
});

function MisCaminosPage() {
  const vistaPrevia = CONEXIONES.slice(0, 3).map((c) => ({ titulo: c.nombreVisible, detalle: `${c.detalle} · ${c.relacion}` }));

  return (
    <MarcoApp>
      <PaginaEnPreparacion
        nombre="Mis Caminos"
        icono={RouteIcon}
        descripcion="Conexiones, seguidores e invitaciones."
        vistaPrevia={vistaPrevia}
      />
    </MarcoApp>
  );
}
