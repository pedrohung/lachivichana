import { createFileRoute } from "@tanstack/react-router";

import { MarcoApp } from "@/components/app/MarcoApp";
import { PanelDerecho } from "@/components/app/PanelDerecho";
import { Muro } from "@/components/muro/Muro";

export const Route = createFileRoute("/explorar")({
  head: () => ({
    meta: [
      { title: "Explorar La Chivichana sin registrarte" },
      {
        name: "description",
        content:
          "Recorre El Malecón público de La Chivichana: publicaciones, campañas de ayuda, empleos y negocios de la comunidad cubana, sin crear cuenta.",
      },
      { property: "og:title", content: "Explorar La Chivichana" },
      {
        property: "og:description",
        content: "Mira cómo funciona la comunidad antes de crear tu cuenta.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ExplorarPage,
});

function ExplorarPage() {
  return (
    <MarcoApp modo="visitante" panelDerecho={<PanelDerecho />}>
      <Muro titulo="El Malecón" subtitulo="Versión pública: puedes leerlo todo sin crear cuenta." />
      <div className="mt-4 xl:hidden">
        <PanelDerecho />
      </div>
    </MarcoApp>
  );
}
