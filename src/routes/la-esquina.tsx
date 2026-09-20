import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MessagesSquare, MessageSquareQuote, Plus } from "lucide-react";
import { toast } from "sonner";

import { MarcoApp } from "@/components/app/MarcoApp";
import { AvatarIniciales } from "@/components/app/Avatar";
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
import { crearHiloEsquina, listarHilosEsquina } from "@/datos/servicios";
import type { HiloEsquina } from "@/datos/tipos";

export const Route = createFileRoute("/la-esquina")({
  head: () => ({
    meta: [
      { title: "La Esquina — La Chivichana" },
      {
        name: "description",
        content: "Opinión y debate: aquí se discuten ideas, no se persigue a personas.",
      },
      { property: "og:title", content: "La Esquina — La Chivichana" },
      {
        property: "og:description",
        content: "Opinión y debate: aquí se discuten ideas, no se persigue a personas.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LaEsquinaPage,
});

function LaEsquinaPage() {
  const { requiereCuenta } = useApp();
  const [hilos, setHilos] = useState<HiloEsquina[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogo, setDialogo] = useState(false);

  const cargar = async () => {
    setCargando(true);
    setError(null);
    try {
      setHilos(await listarHilosEsquina());
    } catch {
      setError("No pudimos cargar los debates. Revisa tu conexión e inténtalo de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargar();
  }, []);

  const recargarTrasCrear = async () => {
    setDialogo(false);
    await cargar();
  };

  return (
    <MarcoApp>
      <div className="space-y-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
              <MessageSquareQuote aria-hidden="true" className="h-5 w-5" />
            </span>
            <div>
              <h1 className="texto-display text-2xl font-bold text-primary">La Esquina</h1>
              <p className="text-sm text-muted-foreground">
                Opinión y debate: aquí se discuten ideas, no se persigue a personas.
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
            Abrir debate
          </Button>
        </header>

        {cargando ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-secondary" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/40 bg-card p-8 text-center">
            <p className="text-sm text-foreground">{error}</p>
            <Button variant="contorno" size="sm" className="mt-3" onClick={() => void cargar()}>
              Reintentar
            </Button>
          </div>
        ) : hilos.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-10 text-center">
            <MessagesSquare aria-hidden="true" className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="texto-display mt-3 text-lg font-bold text-primary">
              La esquina está vacía
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Todavía no se abrió ningún debate. Trae un tema que te queme y empieza la conversación
              con respeto.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {hilos.map((hilo) => (
              <article key={hilo.id} className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="texto-display text-lg font-bold text-foreground">{hilo.titulo}</h2>
                  <span className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
                    <MessagesSquare aria-hidden="true" className="h-3.5 w-3.5" />
                    {hilo.respuestas} {hilo.respuestas === 1 ? "respuesta" : "respuestas"}
                  </span>
                </div>
                <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{hilo.entradilla}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-xs text-muted-foreground">
                    <AvatarIniciales
                      iniciales={hilo.autor.avatar}
                      nombre={hilo.autor.nombreVisible}
                      tamano="sm"
                    />
                    <span className="font-medium text-foreground">{hilo.autor.nombreVisible}</span>
                    <span>· {hilo.fecha}</span>
                  </span>
                  {hilo.temas.length > 0 && (
                    <span className="flex flex-wrap gap-1.5">
                      {hilo.temas.slice(0, 4).map((tema) => (
                        <span
                          key={tema}
                          className="rounded-full bg-secondary px-2 py-0.5 text-xs text-primary"
                        >
                          #{tema}
                        </span>
                      ))}
                    </span>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <DialogoAbrirDebate
        abierto={dialogo}
        alCerrar={() => setDialogo(false)}
        alCrear={() => void recargarTrasCrear()}
      />
    </MarcoApp>
  );
}

function DialogoAbrirDebate({
  abierto,
  alCerrar,
  alCrear,
}: {
  abierto: boolean;
  alCerrar: () => void;
  alCrear: () => void;
}) {
  const [titulo, setTitulo] = useState("");
  const [detalle, setDetalle] = useState("");
  const [enviando, setEnviando] = useState(false);

  const crear = async () => {
    if (titulo.trim().length < 5 || detalle.trim().length < 20) {
      toast.error("Plantea el debate con un título y un detalle que inviten a opinar.");
      return;
    }
    setEnviando(true);
    try {
      await crearHiloEsquina(titulo.trim(), detalle.trim());
      toast.success("Abrimos tu debate en La Esquina");
      alCrear();
    } catch {
      toast.error("No se pudo abrir el debate. Inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <Dialog open={abierto} onOpenChange={(v) => !v && alCerrar()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="texto-display text-primary">Abrir debate</DialogTitle>
          <DialogDescription>
            Propón un tema para discutir ideas con respeto. Nada de ataques personales.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="esquina-titulo">Título</Label>
            <Input
              id="esquina-titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="¿Debe el barrio tener una guagua propia?"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="esquina-detalle">Detalle</Label>
            <Textarea
              id="esquina-detalle"
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              placeholder="Explica tu punto de partida, da contexto y abre la pregunta a la comunidad"
              rows={5}
            />
          </div>
          <Button variant="sol" className="w-full" disabled={enviando} onClick={() => void crear()}>
            {enviando ? "Abriendo…" : "Abrir debate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
