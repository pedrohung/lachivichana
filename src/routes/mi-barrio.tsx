import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Home, MapPin, Plus, Users } from "lucide-react";
import { toast } from "sonner";

import { MarcoApp } from "@/components/app/MarcoApp";
import { useApp } from "@/components/app/contexto";
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
import { crearGrupo, listarGrupos, salirDeGrupo, unirseAGrupo } from "@/datos/servicios";
import type { Grupo } from "@/datos/tipos";

export const Route = createFileRoute("/mi-barrio")({
  head: () => ({
    meta: [
      { title: "Mi Barrio — La Chivichana" },
      { name: "description", content: "Grupos y comunidades por provincia, oficio o afinidad." },
      { property: "og:title", content: "Mi Barrio — La Chivichana" },
      {
        property: "og:description",
        content: "Grupos y comunidades por provincia, oficio o afinidad.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MiBarrioPage,
});

function MiBarrioPage() {
  const { invitado, requiereCuenta } = useApp();
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogo, setDialogo] = useState(false);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      setGrupos(await listarGrupos());
    } catch {
      setError("No pudimos cargar los grupos. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const alternarMembresia = async (grupo: Grupo) => {
    if (!requiereCuenta()) return;
    try {
      if (grupo.esMiembro) {
        await salirDeGrupo(grupo.id);
        toast.success(`Saliste del grupo ${grupo.nombre}`);
      } else {
        await unirseAGrupo(grupo.id);
        toast.success(`Te uniste al grupo ${grupo.nombre}`);
      }
      setGrupos((prev) =>
        prev.map((g) =>
          g.id === grupo.id
            ? {
                ...g,
                esMiembro: !g.esMiembro,
                miembros: g.miembros + (g.esMiembro ? -1 : 1),
              }
            : g,
        ),
      );
    } catch {
      toast.error("No se pudo actualizar tu membresía. Inténtalo de nuevo.");
    }
  };

  return (
    <MarcoApp>
      <div className="space-y-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
              <Home aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h1 className="texto-display text-2xl font-bold text-primary">Mi Barrio</h1>
              <p className="text-sm text-muted-foreground">
                Grupos y comunidades por provincia, oficio o afinidad.
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
            Crear grupo
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
        ) : grupos.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <Users aria-hidden="true" className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="texto-display mt-3 text-lg font-bold text-primary">
              Todavía no hay grupos
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Nadie ha creado el primer grupo de la comunidad. Si inicias sesión, puedes crear uno
              para tu barrio, tu oficio o tu gente.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {grupos.map((grupo) => (
              <article
                key={grupo.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
              >
                <div>
                  <h2 className="texto-display text-lg font-bold text-foreground">
                    {grupo.nombre}
                  </h2>
                  {grupo.descripcion && (
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {grupo.descripcion}
                    </p>
                  )}
                </div>
                <dl className="mt-auto space-y-1 text-xs text-muted-foreground">
                  {grupo.barrio && (
                    <div className="flex items-center gap-1.5">
                      <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                      <dt className="sr-only">Zona</dt>
                      <dd>{grupo.barrio}</dd>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Users aria-hidden="true" className="h-3.5 w-3.5" />
                    <dt className="sr-only">Miembros</dt>
                    <dd>
                      {grupo.miembros.toLocaleString("es")}{" "}
                      {grupo.miembros === 1 ? "miembro" : "miembros"} · {grupo.fecha}
                    </dd>
                  </div>
                </dl>
                <Button
                  variant={grupo.esMiembro ? "outline" : "sol"}
                  size="sm"
                  disabled={invitado}
                  title={invitado ? "Inicia sesión para unirte" : undefined}
                  onClick={() => void alternarMembresia(grupo)}
                >
                  {grupo.esMiembro ? "Salir" : "Unirme"}
                </Button>
              </article>
            ))}
          </div>
        )}
      </div>

      <DialogoCrearGrupo
        abierto={dialogo}
        alCerrar={() => setDialogo(false)}
        alCrear={(grupo) => {
          setGrupos((prev) => [grupo, ...prev]);
          setDialogo(false);
        }}
      />
    </MarcoApp>
  );
}

function DialogoCrearGrupo({
  abierto,
  alCerrar,
  alCrear,
}: {
  abierto: boolean;
  alCerrar: () => void;
  alCrear: (grupo: Grupo) => void;
}) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [zona, setZona] = useState("");
  const [categoria, setCategoria] = useState("");
  const [enviando, setEnviando] = useState(false);

  const crear = async () => {
    if (nombre.trim().length < 3) {
      toast.error("El nombre del grupo necesita al menos 3 caracteres.");
      return;
    }
    setEnviando(true);
    try {
      const datos: { nombre: string; descripcion?: string; categoria?: string; zona?: string } = {
        nombre: nombre.trim(),
      };
      const desc = descripcion.trim();
      if (desc) datos.descripcion = desc;
      const cat = categoria.trim();
      if (cat) datos.categoria = cat;
      const z = zona.trim();
      if (z) datos.zona = z;
      const grupo = await crearGrupo(datos);
      toast.success(`Creamos el grupo ${grupo.nombre}`);
      alCrear(grupo);
    } catch {
      toast.error("No se pudo crear el grupo. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={(v) => !v && alCerrar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="texto-display text-primary">Crear grupo</DialogTitle>
          <DialogDescription>
            Un espacio para tu barrio, tu oficio o tu gente. Tú serás su administradora.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="grupo-nombre">Nombre</Label>
            <Input
              id="grupo-nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Peña de la Calle 23"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="grupo-descripcion">Descripción</Label>
            <Textarea
              id="grupo-descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="De qué trata este grupo y a quién está abierto"
              rows={3}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="grupo-zona">Zona</Label>
              <Input
                id="grupo-zona"
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                placeholder="Vedado, La Habana"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="grupo-categoria">Categoría</Label>
              <Input
                id="grupo-categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                placeholder="Vecinos, oficio, afición…"
              />
            </div>
          </div>
          <Button variant="sol" className="w-full" disabled={enviando} onClick={() => void crear()}>
            {enviando ? "Creando…" : "Crear grupo"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
