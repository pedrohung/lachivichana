import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BadgeCheck, Sprout } from "lucide-react";

import { MarcoApp } from "@/components/app/MarcoApp";
import { Button } from "@/components/ui/button";
import { listarPromotores, type PromotorSimple } from "@/datos/servicios";

export const Route = createFileRoute("/promotores")({
  head: () => ({
    meta: [
      { title: "Los Promotores — La Chivichana" },
      {
        name: "description",
        content: "La red acreditada que verifica, acompaña y entrega la ayuda.",
      },
      { property: "og:title", content: "Los Promotores — La Chivichana" },
      {
        property: "og:description",
        content: "La red acreditada que verifica, acompaña y entrega la ayuda.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PromotoresPage,
});

function PromotoresPage() {
  const [promotores, setPromotores] = useState<PromotorSimple[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      setPromotores(await listarPromotores());
    } catch {
      setError("No pudimos cargar la red de promotores. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  return (
    <MarcoApp>
      <div className="space-y-5">
        <header className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
            <BadgeCheck aria-hidden="true" className="h-5 w-5" />
          </span>
          <div>
            <h1 className="texto-display text-2xl font-bold text-primary">Los Promotores</h1>
            <p className="text-sm text-muted-foreground">
              La red acreditada que verifica, acompaña y entrega la ayuda.
            </p>
          </div>
        </header>

        {cargando ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl bg-secondary" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/40 bg-card p-8 text-center">
            <p className="text-sm text-foreground">{error}</p>
            <Button variant="contorno" size="sm" className="mt-3" onClick={() => void cargar()}>
              Reintentar
            </Button>
          </div>
        ) : promotores.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <Sprout aria-hidden="true" className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="texto-display mt-3 text-lg font-bold text-primary">
              La red se está formando
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Todavía no hay promotores acreditados. Cuando la comunidad acredite a sus primeros
              promotores, aparecerán aquí con su nombre y su trayectoria.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {promotores.map((promotor) => (
              <article
                key={promotor.alias}
                className="flex items-center gap-4 rounded-2xl border border-border bg-card p-5"
              >
                {promotor.avatar ? (
                  <img
                    src={promotor.avatar}
                    alt={`Avatar de ${promotor.nombreVisible}`}
                    className="h-14 w-14 shrink-0 rounded-full border border-border object-cover"
                  />
                ) : (
                  <span
                    role="img"
                    aria-label={`Avatar de ${promotor.nombreVisible}`}
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-border bg-secondary text-sm font-semibold text-primary"
                  >
                    {promotor.nombreVisible.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0">
                  <h2 className="texto-display truncate text-lg font-bold text-foreground">
                    {promotor.nombreVisible}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    @{promotor.alias} · En la comunidad desde {promotor.desde}
                  </p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                    <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" />
                    Promotor acreditado
                  </p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </MarcoApp>
  );
}
