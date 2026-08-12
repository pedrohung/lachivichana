import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Bookmark, CloudOff, LayoutList, PenLine, RefreshCw, Store } from "lucide-react";

import { MarcoApp } from "@/components/app/MarcoApp";
import { AvisoDemo } from "@/components/app/AvisoDemo";
import { useApp } from "@/components/app/contexto";
import { ConsejosSeguridad } from "@/components/mercadito/ConsejosSeguridad";
import { FiltrosMercaditoPanel } from "@/components/mercadito/Filtros";
import { TarjetaArticulo } from "@/components/mercadito/TarjetaArticulo";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FILTROS_MERCADITO_INICIALES,
  obtenerArticulos,
  type FiltrosMercadito,
} from "@/datos/servicios";
import type { Articulo } from "@/datos/tipos";
import { useMercaditoLocal } from "@/estado/mercadito";

export const Route = createFileRoute("/mercadito/")({
  head: () => ({
    meta: [
      { title: "El Mercadito — La Chivichana" },
      {
        name: "description",
        content:
          "Compra, vende, intercambia, dona y encuentra servicios dentro de la comunidad cubana, con identidad pública y trato cuidado.",
      },
      { property: "og:title", content: "El Mercadito — La Chivichana" },
      {
        property: "og:description",
        content: "Ventas, donaciones, intercambios y servicios entre personas de confianza.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MercaditoPage,
});

function MercaditoPage() {
  return (
    <MarcoApp>
      <Catalogo />
    </MarcoApp>
  );
}

function Catalogo() {
  const { invitado, requiereCuenta } = useApp();
  const local = useMercaditoLocal();
  const [filtros, setFiltros] = useState<FiltrosMercadito>(FILTROS_MERCADITO_INICIALES);
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");
  const [articulos, setArticulos] = useState<Articulo[]>([]);
  const [mensajeError, setMensajeError] = useState("");
  const [intento, setIntento] = useState(0);
  const [sinConexion, setSinConexion] = useState(false);

  useEffect(() => {
    const actualizar = () => setSinConexion(!navigator.onLine);
    actualizar();
    window.addEventListener("online", actualizar);
    window.addEventListener("offline", actualizar);
    return () => {
      window.removeEventListener("online", actualizar);
      window.removeEventListener("offline", actualizar);
    };
  }, []);

  const cargar = useCallback(async () => {
    setEstado("cargando");
    try {
      const datos = await obtenerArticulos({
        filtros,
        adicionales: local.creados,
        estados: local.estados,
        eliminados: local.eliminados,
      });
      setArticulos(datos);
      setEstado("listo");
    } catch (error) {
      setMensajeError(error instanceof Error ? error.message : "Algo salió mal.");
      setEstado("error");
    }
  }, [filtros, local.creados, local.estados, local.eliminados]);

  useEffect(() => {
    void cargar();
  }, [cargar, intento]);

  const cambiar = useCallback(
    (parcial: Partial<FiltrosMercadito>) => setFiltros((f) => ({ ...f, ...parcial })),
    [],
  );
  const limpiar = useCallback(() => setFiltros(FILTROS_MERCADITO_INICIALES), []);

  const hayFiltros = useMemo(
    () => JSON.stringify(filtros) !== JSON.stringify(FILTROS_MERCADITO_INICIALES),
    [filtros],
  );

  const protegido = (evento: React.MouseEvent) => {
    if (invitado) {
      evento.preventDefault();
      requiereCuenta();
    }
  };

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
            <Store aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="texto-display text-2xl font-bold text-primary">El Mercadito</h1>
            <p className="text-sm text-muted-foreground">
              Compra, vende, intercambia, dona y encuentra servicios dentro de la comunidad.
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="sol" size="sm">
            <Link to="/mercadito/publicar" onClick={protegido}>
              <PenLine aria-hidden="true" /> Publicar en El Mercadito
            </Link>
          </Button>
          <Button asChild variant="contorno" size="sm">
            <Link to="/mercadito/mis-publicaciones" onClick={protegido}>
              <LayoutList aria-hidden="true" /> Mis publicaciones
            </Link>
          </Button>
          <Button asChild variant="contorno" size="sm">
            <Link to="/mercadito/guardados" onClick={protegido}>
              <Bookmark aria-hidden="true" /> Artículos guardados
            </Link>
          </Button>
        </div>
        <AvisoDemo corto className="mt-4" />
      </header>

      {sinConexion && (
        <p className="flex items-center gap-2 rounded-2xl border border-border bg-muted/60 p-3 text-sm text-muted-foreground">
          <CloudOff aria-hidden="true" className="h-4 w-4" /> Parece que estás sin conexión. Lo que
          ves puede estar desactualizado.
        </p>
      )}

      <FiltrosMercaditoPanel
        filtros={filtros}
        cambiar={cambiar}
        limpiar={limpiar}
        resultados={articulos.length}
      />

      {estado === "cargando" && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-80 rounded-2xl" />
          ))}
        </div>
      )}

      {estado === "error" && (
        <div className="rounded-2xl border border-border bg-card p-6 text-center">
          <p className="text-sm text-foreground">{mensajeError}</p>
          <Button variant="contorno" size="sm" className="mt-3" onClick={() => setIntento((i) => i + 1)}>
            <RefreshCw aria-hidden="true" /> Intentar otra vez
          </Button>
        </div>
      )}

      {estado === "listo" && articulos.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
          <p className="texto-display text-lg font-bold text-primary">
            {hayFiltros ? "No encontramos nada con esos filtros" : "Todavía no hay anuncios"}
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Prueba con otra palabra, amplía la zona o quita alguna condición. También puedes mirar
            todas las modalidades o publicar tú algo.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button variant="contorno" size="sm" onClick={limpiar}>
              Limpiar filtros
            </Button>
            <Button variant="ghost" size="sm" onClick={() => cambiar({ modo: "donacion", texto: "" })}>
              Ver donaciones
            </Button>
            <Button variant="ghost" size="sm" onClick={() => cambiar({ modo: "servicio", texto: "" })}>
              Ver servicios
            </Button>
          </div>
        </div>
      )}

      {estado === "listo" && articulos.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {articulos.map((a) => (
            <TarjetaArticulo key={a.id} articulo={a} />
          ))}
        </div>
      )}

      <ConsejosSeguridad />
    </div>
  );
}
