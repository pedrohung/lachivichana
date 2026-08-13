import { createFileRoute } from "@tanstack/react-router";
import { Hammer } from "lucide-react";

import { MarcoApp } from "@/components/app/MarcoApp";
import { PaginaEnPreparacion } from "@/components/app/PaginaEnPreparacion";
import { OPORTUNIDADES, TIPOS_OPORTUNIDAD } from "@/datos/demo/taller";

export const Route = createFileRoute("/taller")({
  head: () => ({
    meta: [
      { title: "El Taller — La Chivichana" },
      { name: "description", content: "Empleos, mentorías y formación dentro y fuera de la Isla." },
      { property: "og:title", content: "El Taller — La Chivichana" },
      {
        property: "og:description",
        content: "Empleos, mentorías y formación dentro y fuera de la Isla.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TallerPage,
});

function TallerPage() {
  const vistaPrevia = OPORTUNIDADES.slice(0, 3).map((o) => ({
    titulo: o.titulo,
    detalle: `${TIPOS_OPORTUNIDAD[o.tipo]} · ${o.entidad} · ${o.modalidad}`,
  }));

  return (
    <MarcoApp>
      <PaginaEnPreparacion
        nombre="El Taller"
        icono={Hammer}
        descripcion="Empleos, mentorías y formación dentro y fuera de la Isla."
        vistaPrevia={vistaPrevia}
      />
    </MarcoApp>
  );
}
