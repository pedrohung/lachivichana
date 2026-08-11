import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

import { MarcoApp } from "@/components/app/MarcoApp";
import { PaginaEnPreparacion } from "@/components/app/PaginaEnPreparacion";
import { CONVERSACIONES } from "@/datos/demo/avisos";

export const Route = createFileRoute("/mensajes")({
  head: () => ({
    meta: [
      { title: "Mensajes — La Chivichana" },
      { name: "description", content: "Conversaciones privadas con personas, negocios y promotores." },
      { property: "og:title", content: "Mensajes — La Chivichana" },
      { property: "og:description", content: "Conversaciones privadas con personas, negocios y promotores." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MensajesPage,
});

function MensajesPage() {
  const vistaPrevia = CONVERSACIONES.slice(0, 3).map((c) => ({ titulo: c.nombreVisible, detalle: `${c.contexto} · ${c.ultimaFecha}` }));

  return (
    <MarcoApp>
      <PaginaEnPreparacion
        nombre="Mensajes"
        icono={MessageCircle}
        descripcion="Conversaciones privadas con personas, negocios y promotores."
        vistaPrevia={vistaPrevia}
      />
    </MarcoApp>
  );
}
