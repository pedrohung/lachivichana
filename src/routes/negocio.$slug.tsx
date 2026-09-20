import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";

import { MarcoApp } from "@/components/app/MarcoApp";
import { AvatarIniciales } from "@/components/app/Avatar";
import { ResumenReputacion } from "@/components/mercadito/Reputacion";
import { TarjetaArticulo } from "@/components/mercadito/TarjetaArticulo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { obtenerArticulosPorVendedor } from "@/datos/servicios";
import type { Articulo } from "@/datos/tipos";

export const Route = createFileRoute("/negocio/$slug")({
  head: () => ({
    meta: [
      { title: "Perfil de negocio — La Chivichana" },
      {
        name: "description",
        content:
          "Perfil de negocio de una persona de La Chivichana: alias, reputación, antigüedad y anuncios activos.",
      },
      { property: "og:title", content: "Perfil de negocio — La Chivichana" },
      { property: "og:description", content: "Reputación y anuncios de la comunidad." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NegocioPage,
});

function NegocioPage() {
  const { slug } = Route.useParams();
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");
  const [suyos, setSuyos] = useState<Articulo[]>([]);
  const [mensajeError, setMensajeError] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vivo = true;
    setEstado("cargando");
    void obtenerArticulosPorVendedor(slug)
      .then((lista) => {
        if (!vivo) return;
        setSuyos(lista);
        setEstado("listo");
      })
      .catch((e: unknown) => {
        if (!vivo) return;
        setMensajeError(e instanceof Error ? e.message : "No se pudo cargar el negocio");
        setEstado("error");
      });
    return () => {
      vivo = false;
    };
  }, [slug, intento]);

  const persona = suyos[0]?.vendedor;

  return (
    <MarcoApp>
      <div className="space-y-4">
        {estado === "cargando" && (
          <div className="space-y-3">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-80 w-full rounded-2xl" />
          </div>
        )}

        {estado === "error" && (
          <div className="rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-sm text-foreground">{mensajeError}</p>
            <Button
              variant="contorno"
              size="sm"
              className="mt-3"
              onClick={() => setIntento((i) => i + 1)}
            >
              <RefreshCw aria-hidden="true" /> Intentar otra vez
            </Button>
          </div>
        )}

        {estado === "listo" && (
          <>
            {persona ? (
              <header className="flex items-center gap-3 rounded-2xl border border-border bg-card p-5">
                <AvatarIniciales
                  iniciales={persona.avatar}
                  nombre={persona.nombreVisible}
                  tamano="lg"
                />
                <div className="min-w-0">
                  <h1 className="texto-display text-2xl font-bold text-primary">
                    {persona.nombreVisible}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    En La Chivichana desde {persona.desde}
                  </p>
                  <ResumenReputacion persona={persona} />
                </div>
              </header>
            ) : (
              <div className="rounded-2xl border border-border bg-card p-8 text-center">
                <p className="texto-display text-lg font-bold text-primary">
                  No encontramos este perfil
                </p>
                <Button asChild variant="contorno" size="sm" className="mt-3">
                  <Link to="/colmena">Volver a La Colmena</Link>
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
          </>
        )}
      </div>
    </MarcoApp>
  );
}
