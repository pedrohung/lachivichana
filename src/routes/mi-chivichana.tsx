import { createFileRoute } from "@tanstack/react-router";
import { UserCog } from "lucide-react";

import { MarcoApp } from "@/components/app/MarcoApp";
import { PaginaEnPreparacion } from "@/components/app/PaginaEnPreparacion";
import { PERSONAS } from "@/datos/demo/personas";

export const Route = createFileRoute("/mi-chivichana")({
  head: () => ({
    meta: [
      { title: "Mi Chivichana — La Chivichana" },
      {
        name: "description",
        content: "Tu perfil público y tus datos privados, siempre separados.",
      },
      { property: "og:title", content: "Mi Chivichana — La Chivichana" },
      {
        property: "og:description",
        content: "Tu perfil público y tus datos privados, siempre separados.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MiChivichanaPage,
});

function MiChivichanaPage() {
  const vistaPrevia = PERSONAS.slice(0, 3).map((p) => ({
    titulo: p.alias,
    detalle: `${p.ubicacion} · ${p.conexiones} conexiones`,
  }));

  return (
    <MarcoApp>
      <PaginaEnPreparacion
        nombre="Mi Chivichana"
        icono={UserCog}
        descripcion="Tu perfil público y tus datos privados, siempre separados."
        vistaPrevia={vistaPrevia}
      />
    </MarcoApp>
  );
}
