import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  BadgeCheck,
  Bookmark,
  Flag,
  Globe2,
  Heart,
  HandHeart,
  Handshake,
  Lightbulb,
  Link2,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Sparkles,
  Store,
  Users,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";

import { AvatarIniciales } from "@/components/app/Avatar";
import { useApp } from "@/components/app/contexto";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import type { Audiencia, Publicacion, ReaccionClave } from "@/datos/tipos";
import { cn } from "@/lib/utils";

const REACCIONES: { clave: ReaccionClave; nombre: string; icono: typeof Heart; color: string }[] = [
  { clave: "gusta", nombre: "Me gusta", icono: Heart, color: "text-rojo" },
  { clave: "inspira", nombre: "Me inspira", icono: Sparkles, color: "text-sol" },
  { clave: "apoyo", nombre: "Te apoyo", icono: Handshake, color: "text-turquesa" },
  { clave: "gracias", nombre: "Gracias", icono: HandHeart, color: "text-madera" },
  { clave: "interesa", nombre: "Me interesa", icono: Lightbulb, color: "text-primary" },
];

const AUDIENCIA: Record<Audiencia, string> = {
  comunidad: "Toda la comunidad",
  conexiones: "Mis conexiones",
  barrio: "Mi barrio",
  grupo: "Un grupo",
  seleccionadas: "Personas seleccionadas",
};

const FONDOS: Record<string, string> = {
  madera: "bg-[image:linear-gradient(140deg,oklch(0.78_0.07_68),oklch(0.55_0.09_60))]",
  turquesa: "bg-[image:linear-gradient(140deg,oklch(0.82_0.09_195),oklch(0.5_0.09_215))]",
  sol: "bg-[image:linear-gradient(140deg,oklch(0.88_0.13_88),oklch(0.66_0.16_45))]",
};

export function TarjetaPublicacion({ publicacion }: { publicacion: Publicacion }) {
  const { requiereCuenta } = useApp();
  const [reaccion, setReaccion] = useState<ReaccionClave | null>(null);
  const [guardada, setGuardada] = useState(false);
  const [denunciada, setDenunciada] = useState(false);
  const [oculta, setOculta] = useState(false);
  const [voto, setVoto] = useState<number | null>(null);

  const totalReacciones =
    Object.values(publicacion.reacciones).reduce((t, n) => t + n, 0) + (reaccion ? 1 : 0);

  if (oculta) {
    return (
      <article className="rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
        Ocultamos esta publicación de tu muro.{" "}
        <button
          type="button"
          className="font-semibold text-turquesa underline underline-offset-4"
          onClick={() => setOculta(false)}
        >
          Deshacer
        </button>
      </article>
    );
  }

  if (denunciada) {
    return (
      <article className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <EyeOff aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Contenido denunciado</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Gracias por avisar. Ocultamos esta publicación mientras el equipo de convivencia la
              revisa. Nadie sabrá quién la denunció.
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 px-0"
              onClick={() => setDenunciada(false)}
            >
              Ver de todas formas
            </Button>
          </div>
        </div>
      </article>
    );
  }

  const alReaccionar = (clave: ReaccionClave, nombre: string) => {
    if (!requiereCuenta()) return;
    setReaccion((actual) => (actual === clave ? null : clave));
    if (reaccion !== clave) toast.success(`Reaccionaste: ${nombre}`);
  };

  const accionSimple = (mensaje: string, efecto?: () => void) => {
    if (!requiereCuenta()) return;
    efecto?.();
    toast.success(mensaje);
  };

  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
        <AvatarIniciales iniciales={publicacion.autor.avatar} nombre={publicacion.autor.nombreVisible} />
        <div className="min-w-0">
          <p className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-foreground">
              {publicacion.autor.nombreVisible}
            </span>
            {publicacion.autor.insignias.includes("verificado") && (
              <BadgeCheck aria-label="Perfil verificado" className="h-4 w-4 shrink-0 text-turquesa" />
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
            <DropdownMenuItem onSelect={() => accionSimple("Enlace copiado")}>
              <Link2 aria-hidden="true" /> Copiar enlace
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setOculta(true)}>
              <EyeOff aria-hidden="true" /> No me interesa
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setDenunciada(true)}>
              <Flag aria-hidden="true" /> Denunciar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-foreground">
        {publicacion.texto}
      </p>

      {publicacion.imagenes?.length ? (
        <div
          className={cn(
            "mt-3 grid gap-2",
            publicacion.imagenes.length > 1 ? "grid-cols-2" : "grid-cols-1",
          )}
        >
          {publicacion.imagenes.map((img) => (
            <div
              key={img.alt}
              role="img"
              aria-label={img.alt}
              className={cn(
                "flex aspect-[4/3] items-end rounded-xl p-3 text-xs font-medium text-[oklch(0.22_0.06_70)]",
                FONDOS[img.url] ?? FONDOS.madera,
              )}
            >
              <span className="rounded-md bg-crema/80 px-2 py-1">{img.alt}</span>
            </div>
          ))}
        </div>
      ) : null}

      {publicacion.encuesta ? (
        <fieldset className="mt-3 space-y-2">
          <legend className="sr-only">Opciones de la encuesta</legend>
          {publicacion.encuesta.map((opcion, indice) => {
            const total = publicacion.encuesta!.reduce((t, o) => t + o.votos, 0);
            const porcentaje = Math.round((opcion.votos / total) * 100);
            return (
              <button
                key={opcion.texto}
                type="button"
                aria-pressed={voto === indice}
                onClick={() => {
                  if (!requiereCuenta()) return;
                  setVoto(indice);
                  toast.success("Voto registrado en la demostración");
                }}
                className={cn(
                  "w-full min-h-11 rounded-xl border px-3 py-2 text-left text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  voto === indice ? "border-turquesa bg-secondary" : "border-border hover:bg-muted",
                )}
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate">{opcion.texto}</span>
                  <span className="shrink-0 text-xs text-muted-foreground">{porcentaje}%</span>
                </span>
                <Progress value={porcentaje} className="mt-2 h-1.5" />
              </button>
            );
          })}
        </fieldset>
      ) : null}

      {publicacion.adjunto ? (
        <div className="mt-3 rounded-xl border border-border bg-muted/50 p-3">
          <p className="text-[0.65rem] font-semibold tracking-[0.16em] text-turquesa uppercase">
            {publicacion.adjunto.etiqueta}
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">{publicacion.adjunto.titulo}</p>
          <p className="text-xs text-muted-foreground">{publicacion.adjunto.detalle}</p>
        </div>
      ) : null}

      <p className="mt-3 flex flex-wrap gap-2">
        {publicacion.temas.map((t) => (
          <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            #{t}
          </span>
        ))}
      </p>

      <p className="mt-3 flex flex-wrap gap-x-3 text-xs text-muted-foreground">
        <span>{totalReacciones} reacciones</span>
        <span>{publicacion.comentarios.length} comentarios</span>
        <span>{publicacion.compartidos} compartidos</span>
      </p>

      <div className="mt-2 flex flex-wrap gap-1 border-t border-border pt-2">
        {REACCIONES.map((r) => (
          <Button
            key={r.clave}
            type="button"
            variant="ghost"
            size="sm"
            aria-pressed={reaccion === r.clave}
            className={cn("h-10 rounded-full text-xs", reaccion === r.clave && "bg-secondary")}
            onClick={() => alReaccionar(r.clave, r.nombre)}
          >
            <r.icono aria-hidden="true" className={cn(reaccion === r.clave && r.color)} />
            <span className="hidden sm:inline">{r.nombre}</span>
          </Button>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-3 gap-1 border-t border-border pt-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-10 text-xs"
          onClick={() => accionSimple("Comentarios en preparación")}
        >
          <MessageCircle aria-hidden="true" /> Comentar
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-pressed={guardada}
          className={cn("h-10 text-xs", guardada && "text-turquesa")}
          onClick={() =>
            accionSimple(guardada ? "Quitado de guardados" : "Guardado", () =>
              setGuardada((g) => !g),
            )
          }
        >
          <Bookmark aria-hidden="true" /> {guardada ? "Guardado" : "Guardar"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 text-xs"
          onClick={() => accionSimple("Enlace copiado para compartir")}
        >
          <Share2 aria-hidden="true" /> Compartir
        </Button>
      </div>

      {publicacion.comentarios.length > 0 && (
        <ul className="mt-3 space-y-3 border-t border-border pt-3">
          {publicacion.comentarios.map((c) => (
            <li key={c.id} className="flex gap-2">
              <AvatarIniciales iniciales={c.autor.avatar} nombre={c.autor.nombreVisible} tamano="sm" />
              <div className="min-w-0 rounded-xl bg-muted/60 px-3 py-2">
                <p className="text-xs font-semibold text-foreground">
                  {c.autor.nombreVisible} · <span className="font-normal text-muted-foreground">{c.fecha}</span>
                </p>
                <p className="mt-0.5 text-sm text-foreground">{c.texto}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {publicacion.adjunto?.etiqueta === "La Mano" && (
        <p className="mt-3 text-xs text-muted-foreground">
          <Link to="/la-mano" className="font-semibold text-turquesa underline-offset-4 hover:underline">
            Ver la campaña completa en La Mano
          </Link>
        </p>
      )}
    </article>
  );
}