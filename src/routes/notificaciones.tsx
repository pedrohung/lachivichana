import { createFileRoute } from "@tanstack/react-router";
import { Bell } from "lucide-react";

import { MarcoApp } from "@/components/app/MarcoApp";
import { PaginaEnPreparacion } from "@/components/app/PaginaEnPreparacion";
import { NOTIFICACIONES } from "@/datos/demo/avisos";

export const Route = createFileRoute("/notificaciones")({
  head: () => ({
    meta: [
      { title: "Notificaciones — La Chivichana" },
      { name: "description", content: "Lo que ocurrió mientras no estabas." },
      { property: "og:title", content: "Notificaciones — La Chivichana" },
      { property: "og:description", content: "Lo que ocurrió mientras no estabas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotificacionesPage,
});

function NotificacionesPage() {
  const vistaPrevia = NOTIFICACIONES.slice(0, 4).map((n) => ({ titulo: n.texto, detalle: `${n.fecha}${n.leida ? "" : " · sin leer"}` }));

  return (
    <MarcoApp>
      <PaginaEnPreparacion
        nombre="Notificaciones"
        icono={Bell}
        descripcion="Lo que ocurrió mientras no estabas."
        vistaPrevia={vistaPrevia}
      />
    </MarcoApp>
  );
}
