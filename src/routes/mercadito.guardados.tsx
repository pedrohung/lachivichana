import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";

import { MarcoApp } from "@/components/app/MarcoApp";
import { TarjetaArticulo } from "@/components/mercadito/TarjetaArticulo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { listarFavoritos, obtenerArticuloPorId } from "@/datos/servicios";
import type { Articulo } from "@/datos/tipos";
import { SoloConCuenta } from "@/components/app/SoloConCuenta";

export const Route = createFileRoute("/mercadito/guardados")({
  head: () => ({
    meta: [
      { title: "Artículos guardados — El Mercadito" },
      {
        name: "description",
        content: "Los anuncios de El Mercadito que guardaste.",
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
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [mensajeError, setMensajeError] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vivo = true;
    setEstado("cargando");
    void listarFavoritos()
      .then((favoritos) => {
        const ids = favoritos.filter((f) => f.tipo === "producto").map((f) => f.objetivo);
        return Promise.all(ids.map((id) => obtenerArticuloPorId(id)));
      })
      .then((lista) => {
        if (!vivo) return;
        setArticulos(lista.filter((a): a is Articulo => a !== null));
        setEstado("listo");
      })
      .catch((e: unknown) => {
        if (!vivo) return;
        setMensajeError(e instanceof Error ? e.message : "No se pudieron cargar los guardados");
        setEstado("error");
      });
    return () => {
      vivo = false;
    };
  }, [intento]);

  const quitarDeLaLista = (id: string, guardado: boolean) => {
    if (!guardado) setArticulos((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="space-y-4">
      <h1 className="texto-display text-2xl font-bold text-primary">Artículos guardados</h1>

      {estado === "cargando" && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
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

      {estado === "listo" && articulos.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Todavía no guardaste nada. Toca el marcador de cualquier anuncio para tenerlo a mano.
          </p>
          <Button asChild variant="contorno" size="sm" className="mt-3">
            <Link to="/mercadito">Ir a El Mercadito</Link>
          </Button>
        </div>
      )}

      {estado === "listo" && articulos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {articulos.map((a) => (
            <TarjetaArticulo
              key={a.id}
              articulo={a}
              alCambiarFavorito={(guardado) => quitarDeLaLista(a.id, guardado)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
