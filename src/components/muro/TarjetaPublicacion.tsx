import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Eye,
  Globe2,
  HandHeart,
  HeartHandshake,
  Link2,
  Loader2,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Send,
  Sparkles,
  Store,
  ThumbsUp,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { useApp } from "@/components/app/contexto";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  TIPOS_REACCION,
  agregarComentario,
  alternarReaccion,
  eliminarPublicacion,
} from "@/datos/servicios";
import type { Audiencia, Comentario, Publicacion, ReaccionClave } from "@/datos/tipos";
import { useSesion } from "@/estado/sesion";
import { cn } from "@/lib/utils";
import { AvatarAutor } from "./Avatar";

const ICONOS_REACCION: Record<string, LucideIcon> = {
  "thumbs-up": ThumbsUp,
  sparkles: Sparkles,
  "heart-handshake": HeartHandshake,
  "hand-heart": HandHeart,
  eye: Eye,
};

const AUDIENCIA: Record<Audiencia, string> = {
  comunidad: "Toda la comunidad",
  conexiones: "Mis conexiones",
  barrio: "Mi barrio",
  grupo: "Un grupo",
  seleccionadas: "Personas seleccionadas",
};

/** Resalta las #etiquetas dentro del texto de la publicación. */
function TextoConEtiquetas({ texto }: { texto: string }) {
  const partes = texto.split(/(#[\p{L}\p{N}_-]+)/gu);
  return (
    <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-foreground">
      {partes.map((parte, indice) =>
        /^#[\p{L}\p{N}_-]+$/u.test(parte) ? (
          <span key={indice} className="font-semibold text-turquesa">
            {parte}
          </span>
        ) : (
          <span key={indice}>{parte}</span>
        ),
      )}
    </p>
  );
}

type Props = {
  publicacion: Publicacion;
  /** Se invoca cuando la publicación se elimina con éxito para quitarla de la lista. */
  onEliminada?: (id: string) => void;
};

export function TarjetaPublicacion({ publicacion, onEliminada }: Props) {
  const { requiereCuenta } = useApp();
  const { usuario } = useSesion();

  const [conteo, setConteo] = useState(publicacion.reacciones);
  const [miReaccion, setMiReaccion] = useState<ReaccionClave | null>(null);
  const [comentarios, setComentarios] = useState<Comentario[]>(publicacion.comentarios);
  const [comentariosAbiertos, setComentariosAbiertos] = useState(false);
  const [textoComentario, setTextoComentario] = useState("");
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [eliminando, setEliminando] = useState(false);

  const esMio = !!usuario && usuario.username === publicacion.autor.alias;
  const totalReacciones = Object.values(conteo).reduce((t, n) => t + n, 0);

  const alReaccionar = async (clave: ReaccionClave, etiqueta: string) => {
    if (!requiereCuenta()) return;
    const anterior = miReaccion;
    const siguiente = anterior === clave ? null : clave;
    // Optimista: la API mantiene como máximo una reacción por persona.
    setConteo((c) => {
      const nuevo = { ...c };
      if (anterior) nuevo[anterior] = Math.max(0, nuevo[anterior] - 1);
      if (siguiente) nuevo[siguiente] = nuevo[siguiente] + 1;
      return nuevo;
    });
    setMiReaccion(siguiente);
    try {
      await alternarReaccion(publicacion.id, clave);
      if (siguiente) toast.success(`Reaccionaste: ${etiqueta}`);
    } catch (error) {
      setConteo((c) => {
        const nuevo = { ...c };
        if (siguiente) nuevo[siguiente] = Math.max(0, nuevo[siguiente] - 1);
        if (anterior) nuevo[anterior] = nuevo[anterior] + 1;
        return nuevo;
      });
      setMiReaccion(anterior);
      toast.error(error instanceof Error ? error.message : "No se pudo registrar la reacción.");
    }
  };

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/malecon`);
      toast.success("Enlace copiado");
    } catch {
      toast.error("No se pudo copiar el enlace.");
    }
  };

  const alEliminar = async () => {
    if (!esMio || eliminando) return;
    setEliminando(true);
    try {
      await eliminarPublicacion(publicacion.id);
      toast.success("Publicación eliminada");
      onEliminada?.(publicacion.id);
    } catch (error) {
      console.error("Error al eliminar la publicación:", error);
      toast.error("No se pudo eliminar la publicación. Inténtalo de nuevo.");
      setEliminando(false);
    }
  };

  const alComentar = async (evento: React.FormEvent) => {
    evento.preventDefault();
    if (!requiereCuenta()) return;
    const texto = textoComentario.trim();
    if (!texto || enviandoComentario) return;
    setEnviandoComentario(true);
    try {
      const comentario = await agregarComentario(publicacion.id, texto);
      setComentarios((lista) => [...lista, comentario]);
      setTextoComentario("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo publicar el comentario.");
    } finally {
      setEnviandoComentario(false);
    }
  };

  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
        <AvatarAutor autor={publicacion.autor} />
        <div className="min-w-0">
          <p className="flex min-w-0 items-center gap-1.5">
            <Link
              to="/perfil/$alias"
              params={{ alias: publicacion.autor.alias }}
              className="truncate text-sm font-semibold text-foreground hover:text-primary hover:underline"
            >
              {publicacion.autor.nombreVisible}
            </Link>
            {publicacion.autor.insignias.includes("verificado") && (
              <BadgeCheck
                aria-label="Perfil verificado"
                className="h-4 w-4 shrink-0 text-turquesa"
              />
            )}
            {publicacion.autor.insignias.includes("negocio") && (
              <Store aria-label="Negocio" className="h-4 w-4 shrink-0 text-madera" />
            )}
          </p>
          <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            <span>{publicacion.fecha}</span>
            {publicacion.ubicacion && (
              <span className="inline-flex items-center gap-1">
                <MapPin aria-hidden="true" className="h-3 w-3" />
                {publicacion.ubicacion}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              {publicacion.audiencia === "comunidad" ? (
                <Globe2 aria-hidden="true" className="h-3 w-3" />
              ) : (
                <Users aria-hidden="true" className="h-3 w-3" />
              )}
              {AUDIENCIA[publicacion.audiencia]}
            </span>
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Opciones de la publicación">
              <MoreHorizontal aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onSelect={copiarEnlace}>
              <Link2 aria-hidden="true" /> Copiar enlace
            </DropdownMenuItem>
            {esMio && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={alEliminar}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 aria-hidden="true" /> Eliminar publicación
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <TextoConEtiquetas texto={publicacion.texto} />

      {publicacion.imagenes && publicacion.imagenes.length > 0 && (
        <div
          className={cn(
            "mt-3 grid gap-2 overflow-hidden rounded-xl",
            publicacion.imagenes.length > 1 && "grid-cols-2",
          )}
        >
          {publicacion.imagenes.map((img) => (
            <img
              key={img.url}
              src={img.url}
              alt={img.alt || "Imagen de la publicación"}
              loading="lazy"
              className="h-auto w-full rounded-xl border border-border object-cover"
            />
          ))}
        </div>
      )}

      {publicacion.temas.length > 0 && (
        <p className="mt-3 flex flex-wrap gap-2">
          {publicacion.temas.map((t) => (
            <span
              key={t}
              className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
            >
              #{t}
            </span>
          ))}
        </p>
      )}

      <p className="mt-3 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
        <span>{totalReacciones} reacciones</span>
        <span>{comentarios.length} comentarios</span>
        {publicacion.guardados > 0 && <span>{publicacion.guardados} guardados</span>}
        {publicacion.compartidos > 0 && <span>{publicacion.compartidos} compartidos</span>}
      </p>

      <div className="mt-2 flex flex-wrap gap-1 border-t border-border pt-2">
        {TIPOS_REACCION.map((r) => {
          const Icono = ICONOS_REACCION[r.icono] ?? ThumbsUp;
          const activa = miReaccion === r.clave;
          return (
            <Button
              key={r.clave}
              type="button"
              variant="ghost"
              size="sm"
              aria-pressed={activa}
              aria-label={r.etiqueta}
              title={r.etiqueta}
              className={cn("h-10 rounded-full text-xs", activa && "bg-secondary text-primary")}
              onClick={() => void alReaccionar(r.clave, r.etiqueta)}
            >
              <Icono aria-hidden="true" />
              <span>{conteo[r.clave] > 0 ? conteo[r.clave] : r.etiqueta}</span>
            </Button>
          );
        })}
      </div>

      <div className="mt-1 border-t border-border pt-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-10 text-xs"
          aria-expanded={comentariosAbiertos}
          onClick={() => setComentariosAbiertos((abierto) => !abierto)}
        >
          <MessageCircle aria-hidden="true" />
          {comentariosAbiertos ? "Ocultar comentarios" : `Comentar (${comentarios.length})`}
        </Button>
      </div>

      {comentariosAbiertos && (
        <div className="mt-1 border-t border-border pt-3">
          {comentarios.length > 0 ? (
            <ul className="space-y-3">
              {comentarios.map((c) => (
                <li key={c.id} className="flex gap-2">
                  <AvatarAutor autor={c.autor} tamano="sm" />
                  <div className="min-w-0 rounded-xl bg-muted/60 px-3 py-2">
                    <p className="text-xs font-semibold text-foreground">
                      <Link
                        to="/perfil/$alias"
                        params={{ alias: c.autor.alias }}
                        className="hover:underline"
                      >
                        {c.autor.nombreVisible}
                      </Link>{" "}
                      <span className="font-normal text-muted-foreground">{c.fecha}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-foreground">{c.texto}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Todavía no hay comentarios. Sé la primera voz.
            </p>
          )}
          <form onSubmit={alComentar} className="mt-3 flex gap-2">
            <Textarea
              value={textoComentario}
              onChange={(e) => setTextoComentario(e.target.value)}
              placeholder="Escribe un comentario…"
              rows={2}
              className="min-h-10 resize-none"
              aria-label="Escribe un comentario"
            />
            <Button
              type="submit"
              size="icon"
              className="shrink-0"
              disabled={textoComentario.trim().length === 0 || enviandoComentario}
              aria-label="Enviar comentario"
            >
              {enviandoComentario ? (
                <Loader2 aria-hidden="true" className="animate-spin" />
              ) : (
                <Send aria-hidden="true" />
              )}
            </Button>
          </form>
        </div>
      )}
    </article>
  );
}
