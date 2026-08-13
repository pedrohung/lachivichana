import { useCallback, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CloudOff, RefreshCw, Waves } from "lucide-react";

import { AvisoDemo } from "@/components/app/AvisoDemo";
import { useApp } from "@/components/app/contexto";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FILTROS_MURO, type FiltroMuro } from "@/datos/demo/publicaciones";
import { obtenerPublicaciones } from "@/datos/servicios";
import type { Publicacion } from "@/datos/tipos";
import { cn } from "@/lib/utils";
import { Compositor } from "./Compositor";
import { TarjetaPublicacion } from "./TarjetaPublicacion";

type Estado = "cargando" | "listo" | "error";

export function Muro({ titulo, subtitulo }: { titulo: string; subtitulo: string }) {
  const { invitado } = useApp();
  const [filtro, setFiltro] = useState<FiltroMuro>("para-ti");
  const [estado, setEstado] = useState<Estado>("cargando");
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [mensajeError, setMensajeError] = useState("");
  const [intentos, setIntentos] = useState(0);
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
      const datos = await obtenerPublicaciones({ filtro });
      setPublicaciones(datos);
      setEstado("listo");
    } catch (error) {
      setMensajeError(error instanceof Error ? error.message : "Algo salió mal.");
      setEstado("error");
    }
  }, [filtro]);

  useEffect(() => {
    void cargar();
  }, [cargar, intentos]);

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
            <Waves aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="texto-display truncate text-xl font-bold text-primary">{titulo}</h1>
            <p className="text-sm text-muted-foreground">{subtitulo}</p>
          </div>
        </div>
        <AvisoDemo corto className="mt-3" />
      </header>

      <nav aria-label="Filtros del muro" className="-mx-1 overflow-x-auto px-1 pb-1">
        <ul className="flex w-max gap-2">
          {FILTROS_MURO.map((f) => (
            <li key={f.clave}>
              <button
                type="button"
                aria-pressed={filtro === f.clave}
                onClick={() => setFiltro(f.clave)}
                className={cn(
                  "min-h-10 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  filtro === f.clave
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-muted",
                )}
              >
                {f.etiqueta}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {invitado ? (
        <section className="rounded-2xl border border-border bg-card p-4">
          <p className="text-sm font-semibold text-primary">Estás recorriendo El Malecón público</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Puedes leer y navegar sin cuenta. Cuando quieras reaccionar, comentar o publicar, te lo
            pediremos con calma.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild variant="sol" size="sm">
              <Link to="/registro">Crear mi cuenta</Link>
            </Button>
            <Button asChild variant="contorno" size="sm">
              <Link to="/entrar">Entrar</Link>
            </Button>
          </div>
        </section>
      ) : (
        <Compositor />
      )}

      {sinConexion && (
        <p className="flex items-start gap-2 rounded-xl border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
          <CloudOff aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          Parece que no hay conexión. Te mostramos lo último que pudimos cargar.
        </p>
      )}

      {estado === "cargando" && <Esqueletos />}

      {estado === "error" && (
        <div
          role="alert"
          className="rounded-2xl border border-destructive/40 bg-destructive/5 p-4 text-sm"
        >
          <p className="font-semibold text-foreground">{mensajeError}</p>
          <p className="mt-1 text-muted-foreground">
            No perdiste nada. Puedes volver a intentarlo ahora mismo.
          </p>
          <Button
            variant="contorno"
            size="sm"
            className="mt-3"
            onClick={() => setIntentos((i) => i + 1)}
          >
            <RefreshCw aria-hidden="true" /> Reintentar
          </Button>
        </div>
      )}

      {estado === "listo" && publicaciones.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
          <p className="texto-display text-lg font-bold text-primary">
            {filtro === "para-ti" ? "Todavía no hay publicaciones" : "Nada por aquí con ese filtro"}
          </p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
            {filtro === "para-ti"
              ? "Cuando la comunidad empiece a contar cosas, aparecerán aquí."
              : "Prueba con otro filtro o vuelve a «Para ti» para ver todo el muro."}
          </p>
          <Button
            variant="contorno"
            size="sm"
            className="mt-3"
            onClick={() => setFiltro("para-ti")}
          >
            Ver todo el muro
          </Button>
        </div>
      )}

      {estado === "listo" && publicaciones.length > 0 && (
        <div className="space-y-4">
          {publicaciones.map((p) => (
            <TarjetaPublicacion key={p.id} publicacion={p} />
          ))}
          <p className="py-4 text-center text-xs text-muted-foreground">
            Has llegado al final de la demostración. Aquí seguiría cargándose el muro.
          </p>
        </div>
      )}
    </div>
  );
}

function Esqueletos() {
  return (
    <div className="space-y-4" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando publicaciones…</span>
      {[0, 1, 2].map((i) => (
        <div key={i} className="space-y-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-11/12" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}
