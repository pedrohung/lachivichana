import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";

import { MarcoApp } from "@/components/app/MarcoApp";
import { ProveedorApp, useApp } from "@/components/app/contexto";
import { Compositor } from "@/components/muro/Compositor";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/publicar")({
  head: () => ({
    meta: [
      { title: "Crear publicación — La Chivichana" },
      {
        name: "description",
        content: "Comparte algo con la comunidad en El Malecón.",
      },
      { property: "og:title", content: "Crear publicación — La Chivichana" },
      {
        property: "og:description",
        content: "Comparte algo con la comunidad en El Malecón.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PublicarPage,
});

function PublicarPage() {
  return (
    <ProveedorApp>
      <ContenidoPublicar />
    </ProveedorApp>
  );
}

function ContenidoPublicar() {
  const { invitado, requiereCuenta } = useApp();
  const navegar = useNavigate();

  return (
    <MarcoApp>
      <div className="mx-auto max-w-2xl space-y-4">
        <div>
          <h1 className="texto-display text-2xl font-bold text-primary">Crear publicación</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cuéntaselo a la comunidad: aparecerá en El Malecón.
          </p>
        </div>

        {invitado ? (
          <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary">
              <Lock aria-hidden="true" />
            </span>
            <p className="texto-display mt-3 text-lg font-bold text-primary">
              Para publicar hace falta una cuenta
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Estás mirando como visitante. Crea tu cuenta o entra para compartir en El Malecón.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button size="sm" variant="sol" onClick={requiereCuenta}>
                Acceder
              </Button>
              <Button asChild size="sm" variant="contorno">
                <Link to="/malecon">Volver a El Malecón</Link>
              </Button>
            </div>
          </div>
        ) : (
          <Compositor onPublicada={() => void navegar({ to: "/malecon" })} />
        )}
      </div>
    </MarcoApp>
  );
}
