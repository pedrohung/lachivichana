import { createFileRoute } from "@tanstack/react-router";
import { PenLine } from "lucide-react";

import { MarcoApp } from "@/components/app/MarcoApp";
import { PaginaEnPreparacion } from "@/components/app/PaginaEnPreparacion";
import { PUBLICACIONES } from "@/datos/demo/publicaciones";

export const Route = createFileRoute("/publicar")({
  head: () => ({
    meta: [
      { title: "Crear publicación — La Chivichana" },
      { name: "description", content: "Comparte algo con la comunidad eligiendo identidad y audiencia." },
      { property: "og:title", content: "Crear publicación — La Chivichana" },
      { property: "og:description", content: "Comparte algo con la comunidad eligiendo identidad y audiencia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PublicarPage,
});

function PublicarPage() {
  const vistaPrevia = PUBLICACIONES.slice(0, 3).map((p) => ({ titulo: p.tipo, detalle: p.texto.slice(0, 90) + "…" }));

  return (
    <MarcoApp>
      <PaginaEnPreparacion
        nombre="Crear publicación"
        icono={PenLine}
        descripcion="Comparte algo con la comunidad eligiendo identidad y audiencia."
        vistaPrevia={vistaPrevia}
      />
    </MarcoApp>
  );
}
