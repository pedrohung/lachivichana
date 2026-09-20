import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, Hammer, MapPin, Plus } from "lucide-react";
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
  cambiarEstadoTrabajo,
  crearTrabajo,
  listarTrabajos,
  type DatosTrabajo,
} from "@/datos/servicios";
import type { Trabajo } from "@/datos/tipos";

export const Route = createFileRoute("/taller")({
  head: () => ({
    meta: [
      { title: "El Taller — La Chivichana" },
      { name: "description", content: "Empleos, mentorías y formación dentro y fuera de la Isla." },
      { property: "og:title", content: "El Taller — La Chivichana" },
      {
        property: "og:description",
        content: "Empleos, mentorías y formación dentro y fuera de la Isla.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TallerPage,
});

function TallerPage() {
  const { requiereCuenta } = useApp();
  const { usuario } = useSesion();
  const [trabajos, setTrabajos] = useState<Trabajo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogo, setDialogo] = useState(false);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      setTrabajos(await listarTrabajos());
    } catch {
      setError("No pudimos cargar las oportunidades. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const cambiarEstado = async (trabajo: Trabajo, estado: Trabajo["estado"]) => {
    try {
      await cambiarEstadoTrabajo(trabajo.id, estado);
      setTrabajos((prev) => prev.map((t) => (t.id === trabajo.id ? { ...t, estado } : t)));
      toast.success(
        estado === "cerrado"
          ? "La oportunidad quedó cerrada"
          : "La oportunidad vuelve a estar abierta",
      );
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
              <Hammer aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h1 className="texto-display text-2xl font-bold text-primary">El Taller</h1>
              <p className="text-sm text-muted-foreground">
                Empleos, mentorías y formación dentro y fuera de la Isla.
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
            Publicar oportunidad
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
        ) : trabajos.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <Briefcase aria-hidden="true" className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="texto-display mt-3 text-lg font-bold text-primary">
              No hay oportunidades publicadas
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Si buscas personal o quieres ofrecer tu oficio a la comunidad, publica aquí la primera
              oportunidad.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {trabajos.map((trabajo) => {
              const esAutor = usuario?.username === trabajo.autor.alias;
              const abierto = trabajo.estado === "abierto";
              return (
                <article
                  key={trabajo.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        abierto
                          ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {abierto ? "Abierto" : "Cerrado"}
                    </span>
                    {trabajo.categoria && (
                      <span className="text-xs text-muted-foreground">{trabajo.categoria}</span>
                    )}
                  </div>
                  <div>
                    <h2 className="texto-display text-lg font-bold text-foreground">
                      {trabajo.titulo}
                    </h2>
                    {trabajo.descripcion && (
                      <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
                        {trabajo.descripcion}
                      </p>
                    )}
                  </div>
                  <div className="mt-auto space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <AvatarIniciales
                          iniciales={trabajo.autor.avatar}
                          nombre={trabajo.autor.nombreVisible}
                          tamano="sm"
                        />
                        <span className="font-medium text-foreground">
                          {trabajo.autor.nombreVisible}
                        </span>
                      </span>
                      <span>{trabajo.fecha}</span>
                    </div>
                    {trabajo.ubicacion && (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                        {trabajo.ubicacion}
                      </p>
                    )}
                    {esAutor && (
                      <div className="border-t border-border pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            void cambiarEstado(trabajo, abierto ? "cerrado" : "abierto")
                          }
                        >
                          {abierto ? "Cerrar oportunidad" : "Reabrir oportunidad"}
                        </Button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <DialogoPublicarTrabajo
        abierto={dialogo}
        alCerrar={() => setDialogo(false)}
        alCrear={(trabajo) => {
          setTrabajos((prev) => [trabajo, ...prev]);
          setDialogo(false);
        }}
      />
    </MarcoApp>
  );
}

function DialogoPublicarTrabajo({
  abierto,
  alCerrar,
  alCrear,
}: {
  abierto: boolean;
  alCerrar: () => void;
  alCrear: (trabajo: Trabajo) => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [entidad, setEntidad] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [modalidad, setModalidad] = useState("");
  const [remuneracion, setRemuneracion] = useState("");
  const [zona, setZona] = useState("");
  const [categoria, setCategoria] = useState("");
  const [enviando, setEnviando] = useState(false);

  const crear = async () => {
    if (titulo.trim().length < 5 || entidad.trim().length < 2) {
      toast.error("Indica el título y quién ofrece la oportunidad.");
      return;
    }
    setEnviando(true);
    try {
      const datos: DatosTrabajo = {
        titulo: titulo.trim(),
        entidad: entidad.trim(),
      };
      const desc = descripcion.trim();
      if (desc) datos.descripcion = desc;
      const mod = modalidad.trim();
      if (mod) datos.modalidad = mod;
      const rem = remuneracion.trim();
      if (rem) datos.remuneracion = rem;
      const z = zona.trim();
      if (z) datos.zona = z;
      const cat = categoria.trim();
      if (cat) datos.categoria = cat;
      const trabajo = await crearTrabajo(datos);
      toast.success("Publicamos tu oportunidad en El Taller");
      alCrear(trabajo);
    } catch {
      toast.error("No se pudo publicar la oportunidad. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={(v) => !v && alCerrar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="texto-display text-primary">Publicar oportunidad</DialogTitle>
          <DialogDescription>
            Un empleo, una mentoría o una formación para la comunidad.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="taller-titulo">Título</Label>
            <Input
              id="taller-titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Carpintero para taller de madera"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="taller-entidad">Entidad o persona que ofrece</Label>
            <Input
              id="taller-entidad"
              value={entidad}
              onChange={(e) => setEntidad(e.target.value)}
              placeholder="Taller San José"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="taller-descripcion">Descripción</Label>
            <Textarea
              id="taller-descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Requisitos, horario, cómo postularse…"
              rows={3}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="taller-modalidad">Modalidad</Label>
              <Input
                id="taller-modalidad"
                value={modalidad}
                onChange={(e) => setModalidad(e.target.value)}
                placeholder="Presencial, remoto, híbrido"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taller-remuneracion">Remuneración</Label>
              <Input
                id="taller-remuneracion"
                value={remuneracion}
                onChange={(e) => setRemuneracion(e.target.value)}
                placeholder="Salario o pago por trabajo"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taller-zona">Zona</Label>
              <Input
                id="taller-zona"
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                placeholder="Municipio o ciudad"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="taller-categoria">Categoría</Label>
              <Input
                id="taller-categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Construcción, salud, educación…"
              />
            </div>
          </div>
          <Button variant="sol" className="w-full" disabled={enviando} onClick={() => void crear()}>
            {enviando ? "Publicando…" : "Publicar oportunidad"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
