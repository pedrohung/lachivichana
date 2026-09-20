import { createFileRoute } from "@tanstack/react-router";

import { MarcoApp } from "@/components/app/MarcoApp";
import { PanelDerecho } from "@/components/app/PanelDerecho";
import { Muro } from "@/components/muro/Muro";

export const Route = createFileRoute("/malecon")({
  head: () => ({
    meta: [
      { title: "El Malecón — La Chivichana" },
      {
        name: "description",
        content:
          "El muro de La Chivichana: lo que cuenta, ofrece, pide y celebra la comunidad cubana dentro y fuera de la Isla.",
      },
      { property: "og:title", content: "El Malecón — La Chivichana" },
      {
        property: "og:description",
        content: "Publicaciones, ayuda, empleo y negocios de la comunidad cubana.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MaleconPage,
});

function MaleconPage() {
  return (
    <MarcoApp panelDerecho={<PanelDerecho />}>
      <Muro
        titulo="El Malecón"
        subtitulo="Lo que cuenta, ofrece, pide y celebra la comunidad hoy."
      />
      <div className="mt-4 xl:hidden">
        <PanelDerecho />
      </div>
    </MarcoApp>
  );
}
