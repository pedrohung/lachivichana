import { Link } from "@tanstack/react-router";
import { Bookmark, MapPin, Share2 } from "lucide-react";

import { AvatarIniciales } from "@/components/app/Avatar";
import { Button } from "@/components/ui/button";
import type { Articulo } from "@/datos/tipos";
import { cn } from "@/lib/utils";
import { useAccionesArticulo } from "./acciones";
import { DialogoContacto } from "./DialogoContacto";
import { Estrellas, InsigniaVerificado } from "./Reputacion";
import {
  ImagenArticulo,
  InsigniaModalidad,
  MODALIDADES,
  TEXTOS_ESTADO,
  TEXTOS_ESTADO_ANUNCIO,
  textoPrecio,
} from "./modalidades";

export function TarjetaArticulo({
  articulo,
  alCambiarFavorito,
}: {
  articulo: Articulo;
  alCambiarFavorito?: (guardado: boolean) => void;
}) {
  const acciones = useAccionesArticulo(articulo, alCambiarFavorito);
  const estadoAnuncio = articulo.estadoAnuncio ?? "activo";
  const disponible = estadoAnuncio === "activo";

  return (
    <article className="flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative">
        <Link
          to="/producto/$id"
          params={{ id: articulo.id }}
          aria-label={`Ver el anuncio ${articulo.titulo}`}
          className="block focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <ImagenArticulo articulo={articulo} className="h-36 w-full sm:h-40" />
        </Link>
        <div className="absolute top-2 left-2 flex flex-wrap gap-1.5">
          <InsigniaModalidad modo={articulo.modo} />
          {!disponible && (
            <span className="rounded-full border border-border bg-background/95 px-2.5 py-1 text-xs font-semibold text-foreground">
              {TEXTOS_ESTADO_ANUNCIO[estadoAnuncio]}
            </span>
          )}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4">
        <h3 className="text-sm leading-snug font-semibold text-foreground">
          <Link
            to="/producto/$id"
            params={{ id: articulo.id }}
            className="rounded-md hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            {articulo.titulo}
          </Link>
        </h3>

        <p
          className={cn(
            "texto-display text-base font-bold",
            articulo.modo === "donacion" ? "text-turquesa" : "text-primary",
          )}
        >
          {textoPrecio(articulo)}
        </p>

        <p className="text-xs text-muted-foreground">
          {articulo.categoria} · {TEXTOS_ESTADO[articulo.estado]}
        </p>
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {articulo.zona}, {articulo.pais}
          </span>
        </p>

        <div className="mt-1 flex min-w-0 items-center gap-2 border-t border-border pt-3">
          <Link
            to={articulo.vendedor.tipo === "negocio" ? "/negocio/$slug" : "/perfil/$alias"}
            params={
              articulo.vendedor.tipo === "negocio"
                ? { slug: articulo.vendedor.alias }
                : { alias: articulo.vendedor.alias }
            }
            aria-label={`Ver el perfil de ${articulo.vendedor.nombreVisible}`}
            className="shrink-0 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <AvatarIniciales
              iniciales={articulo.vendedor.avatar}
              nombre={articulo.vendedor.nombreVisible}
              tamano="sm"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              to={articulo.vendedor.tipo === "negocio" ? "/negocio/$slug" : "/perfil/$alias"}
              params={
                articulo.vendedor.tipo === "negocio"
                  ? { slug: articulo.vendedor.alias }
                  : { alias: articulo.vendedor.alias }
              }
              className="block truncate rounded-md text-xs font-semibold text-foreground hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {articulo.vendedor.nombreVisible}
            </Link>
            <span className="flex items-center gap-2">
              <Estrellas valor={articulo.vendedor.reputacion} />
              <span className="truncate text-[0.7rem] text-muted-foreground">
                {articulo.publicado}
              </span>
            </span>
          </div>
          {articulo.vendedor.verificado && (
            <InsigniaVerificado negocio={articulo.vendedor.tipo === "negocio"} />
          )}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          <Button
            variant="sol"
            size="sm"
            className="min-w-0 flex-1"
            onClick={acciones.contactar}
            disabled={!disponible}
          >
            {disponible ? MODALIDADES[articulo.modo].accion : TEXTOS_ESTADO_ANUNCIO[estadoAnuncio]}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={acciones.guardado ? "Quitar de guardados" : "Guardar artículo"}
            aria-pressed={acciones.guardado}
            onClick={() => void acciones.guardar()}
          >
            <Bookmark aria-hidden="true" className={cn(acciones.guardado && "fill-sol text-sol")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Compartir artículo"
            onClick={() => void acciones.compartir()}
          >
            <Share2 aria-hidden="true" />
          </Button>
        </div>
      </div>

      <DialogoContacto
        articulo={articulo}
        abierto={acciones.contactoAbierto}
        alCerrar={() => acciones.setContactoAbierto(false)}
      />
    </article>
  );
}
