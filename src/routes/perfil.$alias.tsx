import { Link, createFileRoute } from "@tanstack/react-router";

import { MarcoApp } from "@/components/app/MarcoApp";
import { AvatarIniciales } from "@/components/app/Avatar";
import { ResumenReputacion } from "@/components/mercadito/Reputacion";
import { TarjetaArticulo } from "@/components/mercadito/TarjetaArticulo";
import { Button } from "@/components/ui/button";
import { componerCatalogo } from "@/datos/servicios";
import { useMercaditoLocal } from "@/estado/mercadito";

export const Route = createFileRoute("/perfil/$alias")({
  head: () => ({
    meta: [
      { title: "Perfil público — La Chivichana" },
      {
        name: "description",
        content:
          "Perfil público de una persona de La Chivichana: alias, reputación, antigüedad y anuncios activos.",
      },
      { property: "og:title", content: "Perfil público — La Chivichana" },
      { property: "og:description", content: "Reputación y anuncios de la comunidad." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PerfilPage,
});

function PerfilPage() {
  const { alias } = Route.useParams();
  const local = useMercaditoLocal();
  const catalogo = componerCatalogo({
    adicionales: local.creados,
    estados: local.estados,
    eliminados: local.eliminados,
  });
  const suyos = catalogo.filter((a) => a.vendedor.alias === alias);
  const persona = suyos[0]?.vendedor;

  return (
    <MarcoApp>
      <div className="space-y-4">
        {persona ? (
          <header className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5">
            <AvatarIniciales iniciales={persona.avatar} nombre={persona.nombreVisible} tamano="lg" />
            <div className="min-w-0">
              <h1 className="texto-display text-2xl font-bold text-primary">
                {persona.nombreVisible}
              </h1>
              <ResumenReputacion persona={persona} />
            </div>
          </header>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-8 text-center">
            <p className="texto-display text-lg font-bold text-primary">
              No encontramos este perfil
            </p>
            <Button asChild variant="contorno" size="sm" className="mt-3">
              <Link to="/mercadito">Volver a El Mercadito</Link>
            </Button>
          </div>
        )}

        {suyos.length > 0 && (
          <section className="space-y-3">
            <h2 className="texto-display text-lg font-bold text-primary">Sus anuncios</h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {suyos.map((a) => (
                <TarjetaArticulo key={a.id} articulo={a} />
              ))}
            </div>
          </section>
        )}
      </div>
    </MarcoApp>
  );
}
