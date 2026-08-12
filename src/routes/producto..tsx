import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { ArrowLeft, Bookmark, Flag, MapPin, Share2, Truck } from "lucide-react";

import { MarcoApp } from "@/components/app/MarcoApp";
import { AvatarIniciales } from "@/components/app/Avatar";
import { ConsejosSeguridad } from "@/components/mercadito/ConsejosSeguridad";
import { DialogoContacto } from "@/components/mercadito/DialogoContacto";
import { DialogoDenuncia } from "@/components/mercadito/DialogoDenuncia";
import { ResumenReputacion } from "@/components/mercadito/Reputacion";
import { TarjetaArticulo } from "@/components/mercadito/TarjetaArticulo";
import { useAccionesArticulo } from "@/components/mercadito/acciones";
import {
  ImagenArticulo,
  InsigniaModalidad,
  MODALIDADES,
  TEXTOS_ESTADO,
  TEXTOS_ESTADO_ANUNCIO,
  textoPrecio,
} from "@/components/mercadito/modalidades";
import { Button } from "@/components/ui/button";
import { articulosSimilares, componerCatalogo } from "@/datos/servicios";
import type { Articulo } from "@/datos/tipos";
import { useMercaditoLocal } from "@/estado/mercadito";

export const Route = createFileRoute("/producto/")({
  head: () => ({
    meta: [
      { title: "Anuncio de El Mercadito — La Chivichana" },
      {
        name: "description",
        content:
          "Detalle de un anuncio de El Mercadito: modalidad, zona aproximada, reputación del anunciante y consejos de seguridad.",
      },
      { property: "og:title", content: "Anuncio de El Mercadito" },
      { property: "og:description", content: "Detalle del anuncio en La Chivichana." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductoPage,
  notFoundComponent: () => (
    <MarcoApp>
      <div className="rounded-2xl border border-border bg-card p-8 text-center">
        <p className="texto-display text-lg font-bold text-primary">Este anuncio ya no está</p>
        <Button asChild variant="contorno" size="sm" className="mt-3">
          <Link to="/mercadito">Volver a El Mercadito</Link>
        </Button>
      </div>
    </MarcoApp>
  ),
  errorComponent: ({ error }) => (
    <MarcoApp>
      <p role="alert" className="rounded-2xl border border-border bg-card p-6 text-sm">
        {error.message}
      </p>
    </MarcoApp>
  ),
});

function ProductoPage() {
  const { id } = Route.useParams();
  const local = useMercaditoLocal();
  const catalogo = componerCatalogo({
    adicionales: local.creados,
    estados: local.estados,
    eliminados: local.eliminados,
  });
  const articulo = catalogo.find((a) => a.id === id);
  if (!articulo) throw notFound();

  return (
    <MarcoApp>
      <Detalle articulo={articulo} similares={articulosSimilares(articulo, catalogo)} />
    </MarcoApp>
  );
}

function Detalle({ articulo, similares }: { articulo: Articulo; similares: Articulo[] }) {
  const acciones = useAccionesArticulo(articulo);
  const estadoAnuncio = articulo.estadoAnuncio ?? "activo";

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link to="/mercadito">
          <ArrowLeft aria-hidden="true" /> Volver a El Mercadito
        </Link>
      </Button>

      <article className="overflow-hidden rounded-2xl border border-border bg-card">
        <ImagenArticulo articulo={articulo} className="h-56 w-full sm:h-72" />
        <div className="space-y-4 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <InsigniaModalidad modo={articulo.modo} />
            <span className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {TEXTOS_ESTADO_ANUNCIO[estadoAnuncio]}
            </span>
            <span className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
              {articulo.categoria}
            </span>
          </div>

          <h1 className="texto-display text-2xl font-bold text-primary">{articulo.titulo}</h1>
          <p className="texto-display text-xl font-bold text-foreground">{textoPrecio(articulo)}</p>
          <p className="text-sm leading-relaxed whitespace-pre-line text-foreground">
            {articulo.descripcion}
          </p>

          <dl className="grid gap-2 text-sm sm:grid-cols-2">
            <Dato etiqueta="Estado del artículo" valor={TEXTOS_ESTADO[articulo.estado] ?? "—"} />
            <Dato etiqueta="Publicado" valor={articulo.publicado} />
            <Dato
              etiqueta="Zona aproximada"
              valor={`${articulo.zona}, ${articulo.pais}`}
              icono={<MapPin aria-hidden="true" className="h-4 w-4 text-turquesa" />}
            />
            <Dato
              etiqueta="Entrega"
              valor={articulo.entrega}
              icono={<Truck aria-hidden="true" className="h-4 w-4 text-turquesa" />}
            />
          </dl>
          <p className="rounded-xl border border-border bg-muted/60 p-3 text-xs text-muted-foreground">
            Mostramos sólo la zona general. Nunca publicamos la dirección exacta de nadie.
          </p>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="sol"
              onClick={acciones.contactar}
              disabled={estadoAnuncio !== "activo"}
            >
              {MODALIDADES[articulo.modo].accion}
            </Button>
            <Button variant="contorno" onClick={acciones.guardar} aria-pressed={acciones.guardado}>
              <Bookmark aria-hidden="true" /> {acciones.guardado ? "Guardado" : "Guardar"}
            </Button>
            <Button variant="ghost" onClick={() => void acciones.compartir()}>
              <Share2 aria-hidden="true" /> Compartir
            </Button>
            <Button variant="ghost" onClick={acciones.denunciar}>
              <Flag aria-hidden="true" /> Denunciar
            </Button>
          </div>
        </div>
      </article>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="texto-display text-lg font-bold text-primary">Quién anuncia</h2>
        <div className="mt-3 flex items-center gap-3">
          <AvatarIniciales
            iniciales={articulo.vendedor.avatar}
            nombre={articulo.vendedor.nombreVisible}
          />
          <div className="min-w-0">
            <Link
              to="/perfil/$alias"
              params={{ alias: articulo.vendedor.alias }}
              className="text-sm font-semibold text-foreground hover:underline"
            >
              {articulo.vendedor.nombreVisible}
            </Link>
            <ResumenReputacion persona={articulo.vendedor} />
          </div>
        </div>
      </section>

      <ConsejosSeguridad />

      {similares.length > 0 && (
        <section className="space-y-3">
          <h2 className="texto-display text-lg font-bold text-primary">Anuncios parecidos</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {similares.map((a) => (
              <TarjetaArticulo key={a.id} articulo={a} />
            ))}
          </div>
        </section>
      )}

      <DialogoContacto
        articulo={articulo}
        abierto={acciones.contactoAbierto}
        onOpenChange={acciones.setContactoAbierto}
      />
      <DialogoDenuncia
        abierto={acciones.denunciaAbierta}
        onOpenChange={acciones.setDenunciaAbierta}
        alDenunciar={acciones.confirmarDenuncia}
      />
    </div>
  );
}

function Dato({
  etiqueta,
  valor,
  icono,
}: {
  etiqueta: string;
  valor: string;
  icono?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border p-3">
      <dt className="text-xs text-muted-foreground">{etiqueta}</dt>
      <dd className="mt-0.5 flex items-center gap-1.5 text-sm text-foreground">
        {icono}
        {valor}
      </dd>
    </div>
  );
}
