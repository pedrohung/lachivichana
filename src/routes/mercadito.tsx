import { createFileRoute } from "@tanstack/react-router";
import { Store } from "lucide-react";

import { MarcoApp } from "@/components/app/MarcoApp";
import { PaginaEnPreparacion } from "@/components/app/PaginaEnPreparacion";
import { ARTICULOS } from "@/datos/demo/mercadito";

export const Route = createFileRoute("/mercadito")({
  head: () => ({
    meta: [
      { title: "El Mercadito — La Chivichana" },
      { name: "description", content: "Ventas, intercambios, servicios y donaciones entre personas de confianza." },
      { property: "og:title", content: "El Mercadito — La Chivichana" },
      { property: "og:description", content: "Ventas, intercambios, servicios y donaciones entre personas de confianza." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MercaditoPage,
});

function MercaditoPage() {
  const vistaPrevia = ARTICULOS.slice(0, 3).map((a) => ({ titulo: a.titulo, detalle: `${a.categoria} · ${a.zona} · ${a.modo}` }));

  return (
    <MarcoApp>
      <PaginaEnPreparacion
        nombre="El Mercadito"
        icono={Store}
        descripcion="Ventas, intercambios, servicios y donaciones entre personas de confianza."
        vistaPrevia={vistaPrevia}
      />
    </MarcoApp>
  );
}
