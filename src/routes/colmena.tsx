import { useEffect, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowRight, MapPin, Plus, Store } from "lucide-react";
import { toast } from "sonner";

import { MarcoApp } from "@/components/app/MarcoApp";
import { AvatarIniciales } from "@/components/app/Avatar";
import { ProveedorApp, useApp } from "@/components/app/contexto";
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
import { crearNegocio, listarNegocios, type DatosNegocio } from "@/datos/servicios";
import type { Negocio } from "@/datos/tipos";

export const Route = createFileRoute("/colmena")({
  head: () => ({
    meta: [
      { title: "La Colmena — La Chivichana" },
      {
        name: "description",
        content: "Negocios, profesionales y colaboraciones que abren caminos.",
      },
      { property: "og:title", content: "La Colmena — La Chivichana" },
      {
        property: "og:description",
        content: "Negocios, profesionales y colaboraciones que abren caminos.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ColmenaPage,
});

function inicialesDe(nombre: string): string {
  return nombre
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] ?? "")
    .join("")
    .toUpperCase();
}

function ColmenaPage() {
  return (
    <ProveedorApp>
      <ContenidoColmena />
    </ProveedorApp>
  );
}

function ContenidoColmena() {
  const { requiereCuenta } = useApp();
  const [negocios, setNegocios] = useState<Negocio[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogo, setDialogo] = useState(false);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      setNegocios(await listarNegocios());
    } catch {
      setError("No pudimos cargar los negocios. Revisa tu conexión e inténtalo de nuevo.");
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
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
              <Store aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h1 className="texto-display text-2xl font-bold text-primary">La Colmena</h1>
              <p className="text-sm text-muted-foreground">
                Negocios, profesionales y colaboraciones que abren caminos.
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
            Registrar negocio
          </Button>
        </header>

        {cargando ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-2xl bg-secondary" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/40 bg-card p-8 text-center">
            <p className="text-sm text-foreground">{error}</p>
            <Button variant="contorno" size="sm" className="mt-3" onClick={() => void cargar()}>
              Reintentar
            </Button>
          </div>
        ) : negocios.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <Store aria-hidden="true" className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="texto-display mt-3 text-lg font-bold text-primary">
              Todavía no hay negocios registrados
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              La red de negocios de la comunidad se está formando. Registra el tuyo y sé de los
              primeros.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {negocios.map((negocio) => (
              <Link
                key={negocio.id}
                to="/negocio/$slug"
                params={{ slug: negocio.slug }}
                className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
              >
                {negocio.logo ? (
                  <img
                    src={negocio.logo}
                    alt={`Logotipo de ${negocio.nombre}`}
                    className="h-14 w-14 shrink-0 rounded-full border border-border object-cover"
                  />
                ) : (
                  <AvatarIniciales
                    iniciales={inicialesDe(negocio.nombre)}
                    nombre={negocio.nombre}
                    tamano="lg"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="texto-display text-lg font-bold text-foreground group-hover:text-primary">
                    {negocio.nombre}
                  </h2>
                  {negocio.categoria && (
                    <p className="text-xs font-medium text-muted-foreground">{negocio.categoria}</p>
                  )}
                  {negocio.descripcion && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {negocio.descripcion}
                    </p>
                  )}
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                    {negocio.direccion ? (
                      <span className="flex items-center gap-1.5">
                        <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                        <span className="truncate">{negocio.direccion}</span>
                      </span>
                    ) : (
                      <span />
                    )}
                    <ArrowRight
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0 text-primary opacity-0 transition-opacity group-hover:opacity-100"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <DialogoRegistrarNegocio
        abierto={dialogo}
        alCerrar={() => setDialogo(false)}
        alCrear={(negocio) => {
          setNegocios((prev) => [negocio, ...prev]);
          setDialogo(false);
        }}
      />
    </MarcoApp>
  );
}

function DialogoRegistrarNegocio({
  abierto,
  alCerrar,
  alCrear,
}: {
  abierto: boolean;
  alCerrar: () => void;
  alCrear: (negocio: Negocio) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [sector, setSector] = useState("");
  const [zona, setZona] = useState("");
  const [enviando, setEnviando] = useState(false);

  const crear = async () => {
    if (nombre.trim().length < 2) {
      toast.error("Indica el nombre de tu negocio.");
      return;
    }
    setEnviando(true);
    try {
      const datos: DatosNegocio = { nombre: nombre.trim() };
      const desc = descripcion.trim();
      if (desc) datos.descripcion = desc;
      const sec = sector.trim();
      if (sec) datos.sector = sec;
      const z = zona.trim();
      if (z) datos.zona = z;
      const negocio = await crearNegocio(datos);
      toast.success(`Registramos ${negocio.nombre} en La Colmena`);
      alCrear(negocio);
    } catch {
      toast.error("No se pudo registrar el negocio. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={(v) => !v && alCerrar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="texto-display text-primary">Registrar negocio</DialogTitle>
          <DialogDescription>
            Suma tu negocio a La Colmena y haz que la comunidad te encuentre.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="colmena-nombre">Nombre del negocio</Label>
            <Input
              id="colmena-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Café El Tostadero"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="colmena-descripcion">Descripción</Label>
            <Textarea
              id="colmena-descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Qué ofreces y qué te hace diferente"
              rows={3}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="colmena-sector">Sector</Label>
              <Input
                id="colmena-sector"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="Gastronomía, salud, servicios…"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="colmena-zona">Zona</Label>
              <Input
                id="colmena-zona"
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                placeholder="Dirección o municipio"
              />
            </div>
          </div>
          <Button variant="sol" className="w-full" disabled={enviando} onClick={() => void crear()}>
            {enviando ? "Registrando…" : "Registrar negocio"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
