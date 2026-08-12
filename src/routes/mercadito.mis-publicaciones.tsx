import { useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { MarcoApp } from "@/components/app/MarcoApp";
import { TarjetaArticulo } from "@/components/mercadito/TarjetaArticulo";
import { TEXTOS_ESTADO_ANUNCIO } from "@/components/mercadito/modalidades";
import { Button } from "@/components/ui/button";
import { componerCatalogo } from "@/datos/servicios";
import type { EstadoAnuncio } from "@/datos/tipos";
import { cambiarEstadoAnuncio, eliminarAnuncio, useMercaditoLocal } from "@/estado/mercadito";
import { useApp } from "@/components/app/contexto";

export const Route = createFileRoute("/mercadito/mis-publicaciones")({
  head: () => ({
    meta: [
      { title: "Mis publicaciones — El Mercadito" },
      {
        name: "description",
        content: "Gestiona tus anuncios de El Mercadito: activos, reservados, vendidos y pausados.",
      },
      { property: "og:title", content: "Mis publicaciones — El Mercadito" },
      { property: "og:description", content: "Gestiona tus anuncios en La Chivichana." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MisPublicacionesPage,
});

const PESTANAS: EstadoAnuncio[] = ["activo", "reservado", "vendido", "pausado"];

function MisPublicacionesPage() {
  const { identidad } = useApp();
  const local = useMercaditoLocal();
  const [pestana, setPestana] = useState<EstadoAnuncio>("activo");

  const mios = componerCatalogo({
    adicionales: local.creados,
    estados: local.estados,
    eliminados: local.eliminados,
  }).filter(
    (a) => a.vendedor.alias === identidad.clave || local.creados.some((c) => c.id === a.id),
  );

  const lista = mios.filter((a) => (a.estadoAnuncio ?? "activo") === pestana);

  return (
    <MarcoApp>
      <div className="space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="texto-display text-2xl font-bold text-primary">Mis publicaciones</h1>
          <Button asChild variant="sol" size="sm">
            <Link to="/mercadito/publicar">Publicar otro anuncio</Link>
          </Button>
        </header>

        <div role="tablist" aria-label="Estado del anuncio" className="flex flex-wrap gap-2">
          {PESTANAS.map((p) => (
            <button
              key={p}
              role="tab"
              aria-selected={pestana === p}
              onClick={() => setPestana(p)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
                pestana === p
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {TEXTOS_ESTADO_ANUNCIO[p]}
            </button>
          ))}
        </div>

        {lista.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No tienes anuncios en este estado.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {lista.map((a) => (
              <div key={a.id} className="space-y-2">
                <TarjetaArticulo articulo={a} />
                <div className="flex flex-wrap gap-2">
                  {PESTANAS.filter((p) => p !== (a.estadoAnuncio ?? "activo")).map((p) => (
                    <Button
                      key={p}
                      variant="contorno"
                      size="sm"
                      onClick={() => {
                        cambiarEstadoAnuncio(a.id, p);
                        toast.success(`Marcado como ${TEXTOS_ESTADO_ANUNCIO[p].toLowerCase()}`);
                      }}
                    >
                      {TEXTOS_ESTADO_ANUNCIO[p]}
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      eliminarAnuncio(a.id);
                      toast.success("Anuncio retirado");
                    }}
                  >
                    Retirar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MarcoApp>
  );
}
