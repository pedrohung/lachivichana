import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ImagePlus, Loader2, PenLine, X } from "lucide-react";
import { toast } from "sonner";

import { useApp } from "@/components/app/contexto";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { crearPublicacion } from "@/datos/servicios";
import { useSesion } from "@/estado/sesion";
import { AvatarAutor } from "./Avatar";

const MAX_IMAGENES = 4;

type VistaPrevia = { archivo: File; url: string };

type Props = {
  /** Se invoca con la publicación recién creada. */
  onPublicada: () => void;
};

export function Compositor({ onPublicada }: Props) {
  const { invitado, requiereCuenta } = useApp();
  const { usuario, cargando } = useSesion();
  const entradaImagenes = useRef<HTMLInputElement>(null);

  const [texto, setTexto] = useState("");
  const [vistas, setVistas] = useState<VistaPrevia[]>([]);
  const [publicando, setPublicando] = useState(false);

  const nombreVisible = usuario?.name?.trim() || usuario?.username || "Miembro";
  const puedePublicar = texto.trim().length > 0 && !publicando;

  const alElegirImagenes = (evento: React.ChangeEvent<HTMLInputElement>) => {
    const elegidos = Array.from(evento.target.files ?? []);
    if (elegidos.length === 0) return;
    const espacio = MAX_IMAGENES - vistas.length;
    if (espacio <= 0) {
      toast.info(`Puedes adjuntar hasta ${MAX_IMAGENES} imágenes.`);
      return;
    }
    const nuevos = elegidos.slice(0, espacio).map((archivo) => ({
      archivo,
      url: URL.createObjectURL(archivo),
    }));
    setVistas((actual) => [...actual, ...nuevos]);
    evento.target.value = "";
  };

  const quitarVista = (url: string) => {
    setVistas((actual) => {
      const quitada = actual.find((v) => v.url === url);
      if (quitada) URL.revokeObjectURL(quitada.url);
      return actual.filter((v) => v.url !== url);
    });
  };

  const alPublicar = async () => {
    if (!requiereCuenta()) return;
    if (!puedePublicar) return;
    setPublicando(true);
    try {
      await crearPublicacion(
        texto.trim(),
        vistas.length > 0 ? vistas.map((v) => v.archivo) : undefined,
      );
      setTexto("");
      setVistas((actual) => {
        for (const v of actual) URL.revokeObjectURL(v.url);
        return [];
      });
      toast.success("Tu publicación ya está en El Malecón.");
      onPublicada();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo publicar.");
    } finally {
      setPublicando(false);
    }
  };

  if (cargando) return null;

  if (invitado || !usuario) {
    return (
      <section
        aria-label="Únete para publicar"
        className="rounded-2xl border border-dashed border-border bg-card p-5 text-center"
      >
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-secondary text-primary">
          <PenLine aria-hidden="true" />
        </span>
        <p className="texto-display mt-3 text-lg font-bold text-primary">
          Cuenta lo que pasa en tu esquina
        </p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Crear una cuenta es gratis y te toma un minuto. Publica, comenta y reacciona con la
          comunidad.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Button size="sm" variant="sol" onClick={requiereCuenta}>
            Crear mi cuenta
          </Button>
          <Button asChild size="sm" variant="contorno">
            <Link to="/entrar">Entrar</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Crear publicación"
      className="rounded-2xl border border-border bg-card p-4"
    >
      <div className="flex items-start gap-3">
        <AvatarAutor autor={{ avatar: "", nombreVisible }} />
        <Textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="¿Qué quieres compartir hoy?"
          rows={3}
          className="min-h-20 resize-y"
          aria-label="Texto de la publicación"
        />
      </div>

      {vistas.length > 0 && (
        <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {vistas.map((v) => (
            <li key={v.url} className="relative">
              <img
                src={v.url}
                alt={v.archivo.name}
                className="aspect-square w-full rounded-xl border border-border object-cover"
              />
              <button
                type="button"
                onClick={() => quitarVista(v.url)}
                aria-label={`Quitar ${v.archivo.name}`}
                className="absolute top-1.5 right-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <input
            ref={entradaImagenes}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={alElegirImagenes}
            aria-label="Adjuntar imágenes"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={() => entradaImagenes.current?.click()}
          >
            <ImagePlus aria-hidden="true" /> Foto
          </Button>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Publicando como <span className="font-semibold text-foreground">{nombreVisible}</span>
          </span>
        </div>
        <Button
          type="button"
          size="sm"
          variant="sol"
          disabled={!puedePublicar}
          onClick={alPublicar}
        >
          {publicando && <Loader2 aria-hidden="true" className="animate-spin" />}
          {publicando ? "Publicando…" : "Publicar"}
        </Button>
      </div>
    </section>
  );
}
