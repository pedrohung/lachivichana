import { createFileRoute } from "@tanstack/react-router";
import { Home } from "lucide-react";

import { MarcoApp } from "@/components/app/MarcoApp";
import { PaginaEnPreparacion } from "@/components/app/PaginaEnPreparacion";
import { GRUPOS } from "@/datos/demo/barrios";

export const Route = createFileRoute("/mi-barrio")({
  head: () => ({
    meta: [
      { title: "Mi Barrio — La Chivichana" },
      { name: "description", content: "Grupos y comunidades por provincia, oficio o afinidad." },
      { property: "og:title", content: "Mi Barrio — La Chivichana" },
      { property: "og:description", content: "Grupos y comunidades por provincia, oficio o afinidad." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MiBarrioPage,
});

function MiBarrioPage() {
  const vistaPrevia = GRUPOS.slice(0, 3).map((g) => ({ titulo: g.nombre, detalle: `${g.miembros.toLocaleString("es")} miembros · ${g.actividad}` }));

  return (
    <MarcoApp>
      <PaginaEnPreparacion
        nombre="Mi Barrio"
        icono={Home}
        descripcion="Grupos y comunidades por provincia, oficio o afinidad."
        vistaPrevia={vistaPrevia}
      />
    </MarcoApp>
  );
}
