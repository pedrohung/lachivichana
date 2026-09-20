import { useCallback, useEffect, useState } from "react";
import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  Flag,
  Heart,
  MapPin,
  Pencil,
  RefreshCw,
  Share2,
  Trash2,
  Truck,
} from "lucide-react";
import { toast } from "sonner";

import { MarcoApp } from "@/components/app/MarcoApp";
import { AvatarIniciales } from "@/components/app/Avatar";
import { ConsejosSeguridad } from "@/components/mercadito/ConsejosSeguridad";
import { DialogoContacto } from "@/components/mercadito/DialogoContacto";
import { DialogoDenuncia } from "@/components/mercadito/DialogoDenuncia";
import { InsigniaVerificado, ResumenReputacion } from "@/components/mercadito/Reputacion";
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
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  articulosSimilares,
  cambiarEstadoArticulo,
  eliminarArticulo,
  obtenerArticuloPorId,
  obtenerArticulos,
} from "@/datos/servicios";
import type { Articulo } from "@/datos/tipos";
import { useSesion } from "@/estado/sesion";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/producto/$id")({
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
  const [estado, setEstado] = useState<"cargando" | "listo" | "error">("cargando");
  const [articulo, setArticulo] = useState<Articulo | null>(null);
  const [mensajeError, setMensajeError] = useState("");
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    let vivo = true;
    setEstado("cargando");
    void obtenerArticuloPorId(id)
      .then((a) => {
        if (!vivo) return;
        setArticulo(a);
        setEstado("listo");
      })
      .catch((e: unknown) => {
        if (!vivo) return;
        setMensajeError(e instanceof Error ? e.message : "No se pudo cargar el anuncio");
        setEstado("error");
      });
    return () => {
      vivo = false;
    };
  }, [id, intento]);

  if (estado === "cargando")
    return (
      <MarcoApp>
        <div className="space-y-4">
          <Skeleton className="h-9 w-44" />
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
        </div>
      </MarcoApp>
    );

  if (estado === "error")
    return (
      <MarcoApp>
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p role="alert" className="text-sm text-foreground">
            {mensajeError}
          </p>
          <Button
            variant="contorno"
            size="sm"
            className="mt-3"
            onClick={() => setIntento((i) => i + 1)}
          >
            <RefreshCw aria-hidden="true" /> Intentar otra vez
          </Button>
        </div>
      </MarcoApp>
    );

  if (!articulo) throw notFound();

  return (
    <MarcoApp>
      <Detalle
        articulo={articulo}
        alCambiarArticulo={setArticulo}
        alEliminar={() => setArticulo(null)}
      />
    </MarcoApp>
  );
}

function Detalle({
  articulo,
  alCambiarArticulo,
  alEliminar,
}: {
  articulo: Articulo;
  alCambiarArticulo: (a: Articulo) => void;
  alEliminar: () => void;
}) {
  const navegar = useNavigate();
  const { usuario } = useSesion();
  const acciones = useAccionesArticulo(articulo);
  const estadoAnuncio = articulo.estadoAnuncio ?? "activo";
  const disponible = estadoAnuncio === "activo";
  const esPropio = !!usuario && usuario.username === articulo.vendedor.alias;

  const [similares, setSimilares] = useState<Articulo[]>([]);
  const [imagenActual, setImagenActual] = useState(0);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);

  useEffect(() => {
    let vivo = true;
    void obtenerArticulos()
      .then((catalogo) => {
        if (vivo) setSimilares(articulosSimilares(articulo, catalogo));
      })
      .catch(() => {
        /* los similares son opcionales */
      });
    return () => {
      vivo = false;
    };
  }, [articulo]);

  const cambiarEstado = useCallback(
    async (nuevo: "disponible" | "reservado" | "vendido" | "retirado") => {
      setCambiandoEstado(true);
      try {
        await cambiarEstadoArticulo(articulo.id, nuevo);
        const actualizado = await obtenerArticuloPorId(articulo.id);
        if (actualizado) alCambiarArticulo(actualizado);
        toast.success(
          nuevo === "vendido"
            ? "Marcado como vendido"
            : nuevo === "disponible"
              ? "El anuncio vuelve a estar disponible"
              : "Estado actualizado",
        );
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "No se pudo cambiar el estado");
      } finally {
        setCambiandoEstado(false);
      }
    },
    [articulo, alCambiarArticulo],
  );

  const eliminar = useCallback(async () => {
    try {
      await eliminarArticulo(articulo.id);
      toast.success("Anuncio eliminado");
      alEliminar();
      void navegar({ to: "/mercadito" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo eliminar el anuncio");
    }
  }, [articulo.id, alEliminar, navegar]);

  const imagenes = articulo.imagenes ?? [];

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link to="/mercadito">
          <ArrowLeft aria-hidden="true" /> Volver a El Mercadito
        </Link>
      </Button>

      <article className="overflow-hidden rounded-2xl border border-border bg-card">
        {imagenes.length > 1 ? (
          <div className="space-y-2">
            <img
              src={imagenes[imagenActual]?.url}
              alt={imagenes[imagenActual]?.alt || articulo.imagenAlt}
              className="h-56 w-full object-cover sm:h-72"
            />
            <div className="flex gap-2 overflow-x-auto px-5 pb-1">
              {imagenes.map((img, i) => (
                <button
                  key={img.url}
                  type="button"
                  onClick={() => setImagenActual(i)}
                  aria-label={`Ver foto ${i + 1}`}
                  aria-pressed={imagenActual === i}
                  className={cn(
                    "shrink-0 overflow-hidden rounded-lg border-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    imagenActual === i ? "border-primary" : "border-transparent",
                  )}
                >
                  <img src={img.url} alt="" className="h-16 w-16 object-cover" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ImagenArticulo articulo={articulo} className="h-56 w-full sm:h-72" />
        )}

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

          {!esPropio && (
            <div className="flex flex-wrap gap-2">
              <Button variant="sol" onClick={acciones.contactar} disabled={!disponible}>
                {MODALIDADES[articulo.modo].accion}
              </Button>
              <Button
                variant={acciones.guardado ? "sol" : "contorno"}
                onClick={() => void acciones.guardar()}
                aria-pressed={acciones.guardado}
              >
                <Heart aria-hidden="true" className={cn(acciones.guardado && "fill-current")} />
                {acciones.guardado ? "Guardado" : "Guardar"}
              </Button>
              <Button variant="ghost" onClick={() => void acciones.compartir()}>
                <Share2 aria-hidden="true" /> Compartir
              </Button>
              <Button variant="ghost" onClick={acciones.denunciar}>
                <Flag aria-hidden="true" /> Denunciar
              </Button>
            </div>
          )}

          {esPropio && (
            <div className="space-y-2 rounded-2xl border border-border bg-muted/40 p-4">
              <p className="text-sm font-semibold text-foreground">Este anuncio es tuyo</p>
              <div className="flex flex-wrap gap-2">
                {estadoAnuncio !== "vendido" && (
                  <Button
                    variant="sol"
                    size="sm"
                    disabled={cambiandoEstado}
                    onClick={() => void cambiarEstado("vendido")}
                  >
                    Marcar vendido
                  </Button>
                )}
                {estadoAnuncio !== "activo" && (
                  <Button
                    variant="contorno"
                    size="sm"
                    disabled={cambiandoEstado}
                    onClick={() => void cambiarEstado("disponible")}
                  >
                    Marcar disponible
                  </Button>
                )}
                <Button asChild variant="contorno" size="sm">
                  <Link to="/producto/$id/editar" params={{ id: articulo.id }}>
                    <Pencil aria-hidden="true" /> Editar
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Trash2 aria-hidden="true" /> Eliminar
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>¿Eliminar este anuncio?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Se borrará “{articulo.titulo}” de El Mercadito. No se puede deshacer.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={() => void eliminar()}>
                        Eliminar anuncio
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          )}
        </div>
      </article>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="texto-display text-lg font-bold text-primary">Quién anuncia</h2>
        <div className="mt-3 flex items-center gap-3">
          <AvatarIniciales
            iniciales={articulo.vendedor.avatar}
            nombre={articulo.vendedor.nombreVisible}
          />
          <div className="min-w-0 flex-1">
            <Link
              to="/perfil/$alias"
              params={{ alias: articulo.vendedor.alias }}
              className="text-sm font-semibold text-foreground hover:underline"
            >
              {articulo.vendedor.nombreVisible}
            </Link>
            {articulo.vendedor.verificado && (
              <div className="mt-1">
                <InsigniaVerificado negocio={articulo.vendedor.tipo === "negocio"} />
              </div>
            )}
            <div className="mt-2">
              <ResumenReputacion persona={articulo.vendedor} />
            </div>
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
        alCerrar={() => acciones.setContactoAbierto(false)}
      />
      <DialogoDenuncia
        abierto={acciones.denunciaAbierta}
        onOpenChange={acciones.setDenunciaAbierta}
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
