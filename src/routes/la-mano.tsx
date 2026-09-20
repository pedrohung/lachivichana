import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { HandHeart, MapPin, Plus } from "lucide-react";
import { toast } from "sonner";

import { MarcoApp } from "@/components/app/MarcoApp";
import { AvatarIniciales } from "@/components/app/Avatar";
import { useApp } from "@/components/app/contexto";
import { useSesion } from "@/estado/sesion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  cambiarEstadoSolicitud,
  crearSolicitud,
  listarSolicitudes,
  type DatosSolicitud,
} from "@/datos/servicios";
import type { SolicitudAyuda } from "@/datos/tipos";

export const Route = createFileRoute("/la-mano")({
  head: () => ({
    meta: [
      { title: "La Mano — La Chivichana" },
      {
        name: "description",
        content: "Campañas de ayuda con verificación, seguimiento y entrega justificada.",
      },
      { property: "og:title", content: "La Mano — La Chivichana" },
      {
        property: "og:description",
        content: "Campañas de ayuda con verificación, seguimiento y entrega justificada.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LaManoPage,
});

const ETIQUETA_ESTADO: Record<SolicitudAyuda["estado"], string> = {
  abierta: "Abierta",
  en_curso: "En curso",
  resuelta: "Resuelta",
};

const COLOR_ESTADO: Record<SolicitudAyuda["estado"], string> = {
  abierta: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  en_curso: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  resuelta: "bg-muted text-muted-foreground",
};

function LaManoPage() {
  const { requiereCuenta } = useApp();
  const { usuario } = useSesion();
  const [solicitudes, setSolicitudes] = useState<SolicitudAyuda[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogo, setDialogo] = useState(false);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      setSolicitudes(await listarSolicitudes());
    } catch {
      setError("No pudimos cargar las campañas. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const cambiarEstado = async (solicitud: SolicitudAyuda, estado: SolicitudAyuda["estado"]) => {
    try {
      await cambiarEstadoSolicitud(solicitud.id, estado);
      setSolicitudes((prev) => prev.map((s) => (s.id === solicitud.id ? { ...s, estado } : s)));
      toast.success(`La campaña ahora está ${ETIQUETA_ESTADO[estado].toLowerCase()}`);
    } catch {
      toast.error("No se pudo cambiar el estado. Inténtalo de nuevo.");
    }
  };

  return (
    <MarcoApp>
      <div className="space-y-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
              <HandHeart aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h1 className="texto-display text-2xl font-bold text-primary">La Mano</h1>
              <p className="text-sm text-muted-foreground">
                Campañas de ayuda con verificación, seguimiento y entrega justificada.
              </p>
            </div>
          </div>
          <Button
            variant="sol"
            size="sm"
            onClick={() => {
              if (requiereCuenta()) setDialogo(true);
            }}
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Publicar campaña
          </Button>
        </header>

        {cargando ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl bg-secondary" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/40 bg-card p-8 text-center">
            <p className="text-sm text-foreground">{error}</p>
            <Button variant="contorno" size="sm" className="mt-3" onClick={() => void cargar()}>
              Reintentar
            </Button>
          </div>
        ) : solicitudes.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <HandHeart aria-hidden="true" className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="texto-display mt-3 text-lg font-bold text-primary">
              No hay campañas abiertas
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Cuando alguien de la comunidad pida una mano, su campaña aparecerá aquí.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {solicitudes.map((solicitud) => {
              const esAutora = usuario?.username === solicitud.autor.alias;
              return (
                <article
                  key={solicitud.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${COLOR_ESTADO[solicitud.estado]}`}
                    >
                      {ETIQUETA_ESTADO[solicitud.estado]}
                    </span>
                    {solicitud.categoria && (
                      <span className="text-xs text-muted-foreground">{solicitud.categoria}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="texto-display text-lg font-bold text-foreground">
                      {solicitud.titulo}
                    </h2>
                    {solicitud.descripcion && (
                      <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                        {solicitud.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="mt-auto space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <AvatarIniciales
                          iniciales={solicitud.autor.avatar}
                          nombre={solicitud.autor.nombreVisible}
                          tamano="sm"
                        />
                        <span className="font-medium text-foreground">
                          {solicitud.autor.nombreVisible}
                        </span>
                      </span>
                      <span>{solicitud.fecha}</span>
                    </div>
                    {solicitud.ubicacion && (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                        {solicitud.ubicacion}
                      </p>
                    )}
                    {esAutora && (
                      <div className="flex gap-2 border-t border-border pt-3">
                        {(Object.keys(ETIQUETA_ESTADO) as SolicitudAyuda["estado"][])
                          .filter((e) => e !== solicitud.estado)
                          .map((e) => (
                            <Button
                              key={e}
                              variant="outline"
                              size="sm"
                              onClick={() => void cambiarEstado(solicitud, e)}
                            >
                              Marcar {ETIQUETA_ESTADO[e].toLowerCase()}
                            </Button>
                          ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <DialogoPublicarCampana
        abierto={dialogo}
        alCerrar={() => setDialogo(false)}
        alCrear={(solicitud) => {
          setSolicitudes((prev) => [solicitud, ...prev]);
          setDialogo(false);
        }}
      />
    </MarcoApp>
  );
}

function DialogoPublicarCampana({
  abierto,
  alCerrar,
  alCrear,
}: {
  abierto: boolean;
  alCerrar: () => void;
  alCrear: (solicitud: SolicitudAyuda) => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [zona, setZona] = useState("");
  const [enviando, setEnviando] = useState(false);

  const crear = async () => {
    if (titulo.trim().length < 5 || descripcion.trim().length < 15) {
      toast.error("Cuéntanos un poco más: título y una descripción con detalle.");
      return;
    }
    setEnviando(true);
    try {
      const datos: DatosSolicitud = {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
      };
      const cat = categoria.trim();
      if (cat) datos.categoria = cat;
      const z = zona.trim();
      if (z) datos.zona = z;
      const solicitud = await crearSolicitud(datos);
      toast.success("Publicamos tu campaña de ayuda");
      alCrear(solicitud);
    } catch {
      toast.error("No se pudo publicar la campaña. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={(v) => !v && alCerrar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="texto-display text-primary">Publicar campaña</DialogTitle>
          <DialogDescription>
            Pide una mano a la comunidad. Sé específica: qué necesitas y para cuándo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="mano-titulo">Título</Label>
            <Input
              id="mano-titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ayuda para reparar el techo del comedor"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mano-descripcion">Descripción</Label>
            <Textarea
              id="mano-descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Explica la situación, qué se necesita y cómo se entregará la ayuda"
              rows={4}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="mano-categoria">Categoría</Label>
              <Input
                id="mano-categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Salud, vivienda, alimentos…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mano-zona">Zona</Label>
              <Input
                id="mano-zona"
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                placeholder="Municipio o barrio"
              />
            </div>
          </div>
          <Button variant="sol" className="w-full" disabled={enviando} onClick={() => void crear()}>
            {enviando ? "Publicando…" : "Publicar campaña"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
