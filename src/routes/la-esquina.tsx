import { createFileRoute } from "@tanstack/react-router";
import { MessageSquareQuote } from "lucide-react";

import { MarcoApp } from "@/components/app/MarcoApp";
import { PaginaEnPreparacion } from "@/components/app/PaginaEnPreparacion";
import { HILOS } from "@/datos/demo/esquina";

export const Route = createFileRoute("/la-esquina")({
  head: () => ({
    meta: [
      { title: "La Esquina — La Chivichana" },
      {
        name: "description",
        content: "Opinión y debate: aquí se discuten ideas, no se persigue a personas.",
      },
      { property: "og:title", content: "La Esquina — La Chivichana" },
      {
        property: "og:description",
        content: "Opinión y debate: aquí se discuten ideas, no se persigue a personas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LaEsquinaPage,
});

function LaEsquinaPage() {
  const vistaPrevia = HILOS.slice(0, 3).map((h) => ({
    titulo: h.titulo,
    detalle: `${h.formato} · ${h.respuestas} respuestas · ${h.participantes} participantes`,
  }));

  return (
    <MarcoApp>
      <PaginaEnPreparacion
        nombre="La Esquina"
        icono={MessageSquareQuote}
        descripcion="Opinión y debate: aquí se discuten ideas, no se persigue a personas."
        vistaPrevia={vistaPrevia}
      />
    </MarcoApp>
  );
}
