import { Link, createFileRoute } from "@tanstack/react-router";

import { MarcoApp } from "@/components/app/MarcoApp";
import { TarjetaArticulo } from "@/components/mercadito/TarjetaArticulo";
import { Button } from "@/components/ui/button";
import { componerCatalogo } from "@/datos/servicios";
import { useMercaditoLocal } from "@/estado/mercadito";
import { SoloConCuenta } from "@/components/app/SoloConCuenta";

export const Route = createFileRoute("/mercadito/guardados")({
  head: () => ({
    meta: [
      { title: "Artículos guardados — El Mercadito" },
      {
        name: "description",
        content: "Los anuncios de El Mercadito que guardaste durante esta demostración.",
      },
      { property: "og:title", content: "Artículos guardados — El Mercadito" },
      { property: "og:description", content: "Tus anuncios guardados en La Chivichana." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GuardadosPage,
});

function GuardadosPage() {
  return (
    <MarcoApp>
      <SoloConCuenta titulo="Artículos guardados">
        <ListaGuardados />
      </SoloConCuenta>
    </MarcoApp>
  );
}

function ListaGuardados() {
  const local = useMercaditoLocal();
  const catalogo = componerCatalogo({
    adicionales: local.creados,
    estados: local.estados,
    eliminados: local.eliminados,
  });
  const guardados = catalogo.filter((a) => local.guardados.includes(a.id));

  return (
    <div className="space-y-4">
      <h1 className="texto-display text-2xl font-bold text-primary">Artículos guardados</h1>
      {guardados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Todavía no guardaste nada. Toca el marcador de cualquier anuncio para tenerlo a mano.
          </p>
          <Button asChild variant="contorno" size="sm" className="mt-3">
            <Link to="/mercadito">Ir a El Mercadito</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {guardados.map((a) => (
            <TarjetaArticulo key={a.id} articulo={a} />
          ))}
        </div>
      )}
    </div>
  );
}
