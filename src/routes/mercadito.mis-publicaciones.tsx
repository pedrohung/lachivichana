import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Pencil, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { MarcoApp } from "@/components/app/MarcoApp";
import { TarjetaArticulo } from "@/components/mercadito/TarjetaArticulo";
import { TEXTOS_ESTADO_ANUNCIO } from "@/components/mercadito/modalidades";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cambiarEstadoArticulo, eliminarArticulo, obtenerMisArticulos } from "@/datos/servicios";
import type { Articulo } from "@/datos/tipos";
import { SoloConCuenta } from "@/components/app/SoloConCuenta";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

const PESTANAS = ["activo", "reservado", "vendido", "pausado"] as const;
type Pestana = (typeof PESTANAS)[number];

const CAMBIOS: { valor: "disponible" | "reservado" | "vendido" | "retirado"; pestana: Pestana }[] =
  [
    { valor: "disponible", pestana: "activo" },
    { valor: "reservado", pestana: "reservado" },
    { valor: "vendido", pestana: "vendido" },
    { valor: "retirado", pestana: "pausado" },
  ];

function MisPublicacionesPage() {
  return (
    <MarcoApp>
      <SoloConCuenta titulo="Mis publicaciones">
        <ListaPublicaciones />
      </SoloConCuenta>
    </MarcoApp>
  );
}

function ListaPublicaciones() {
  const [pestana, setPestana] = useState<Pestana>("activo");
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [mensajeError, setMensajeError] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vivo = true;
    setEstado("cargando");
    void obtenerMisArticulos()
      .then((lista) => {
        if (!vivo) return;
        setArticulos(lista);
        setEstado("listo");
      })
      .catch((e: unknown) => {
        if (!vivo) return;
        setMensajeError(e instanceof Error ? e.message : "No se pudieron cargar tus anuncios");
        setEstado("error");
      });
    return () => {
      vivo = false;
    };
  }, [intento]);

  const lista = articulos.filter((a) => (a.estadoAnuncio ?? "activo") === pestana);

  const cambiarEstado = async (
    id: string,
    nuevo: "disponible" | "reservado" | "vendido" | "retirado",
  ) => {
    try {
      await cambiarEstadoArticulo(id, nuevo);
      const destino = CAMBIOS.find((c) => c.valor === nuevo)!.pestana;
      setArticulos((prev) => prev.map((a) => (a.id === id ? { ...a, estadoAnuncio: destino } : a)));
      toast.success(`Marcado como ${TEXTOS_ESTADO_ANUNCIO[destino]?.toLowerCase()}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo cambiar el estado");
    }
  };

  const eliminar = async (id: string, titulo: string) => {
    try {
      await eliminarArticulo(id);
      setArticulos((prev) => prev.filter((a) => a.id !== id));
      toast.success(`Retiramos “${titulo}”`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo retirar el anuncio");
    }
  };

  return (
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

      {estado === "listo" && lista.length === 0 && (
        <p className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No tienes anuncios en este estado.
        </p>
      )}

      {estado === "listo" && lista.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {lista.map((a) => (
            <div key={a.id} className="space-y-2">
              <TarjetaArticulo articulo={a} />
              <div className="flex flex-wrap gap-2">
                {CAMBIOS.filter((c) => c.pestana !== (a.estadoAnuncio ?? "activo")).map((c) => (
                  <Button
                    key={c.valor}
                    variant="contorno"
                    size="sm"
                    onClick={() => void cambiarEstado(a.id, c.valor)}
                  >
                    {TEXTOS_ESTADO_ANUNCIO[c.pestana]}
                  </Button>
                ))}
                <Button asChild variant="ghost" size="sm">
                  <Link to="/producto/$id/editar" params={{ id: a.id }}>
                    <Pencil aria-hidden="true" /> Editar
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      Retirar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Retirar este anuncio?</AlertDialogTitle>
                      <AlertDialogDescription>
                        “{a.titulo}” dejará de verse en El Mercadito. Esta acción no se puede
                        deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => void eliminar(a.id, a.titulo)}>
                        Retirar anuncio
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
