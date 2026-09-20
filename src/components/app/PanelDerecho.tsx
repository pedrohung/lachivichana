import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";

import { listarGrupos, listarNegocios, listarSolicitudes, listarTrabajos } from "@/datos/servicios";
import type { Grupo, Negocio, SolicitudAyuda, Trabajo } from "@/datos/tipos";

function Bloque({
  titulo,
  enlace,
  etiquetaEnlace,
  children,
}: {
  titulo: string;
  enlace: string;
  etiquetaEnlace: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
        <h2 className="texto-display truncate text-sm font-bold text-primary">{titulo}</h2>
        <Link
          to={enlace}
          className="shrink-0 rounded-md text-xs font-semibold text-turquesa underline-offset-4 hover:underline focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
        >
          {etiquetaEnlace}
        </Link>
      </div>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

/**
 * Carga los primeros elementos de una lista. Mientras carga devuelve `null`
 * (carga silenciosa); si la carga falla devuelve lista vacía y el bloque se
 * oculta.
 */
function usePrimeros<T>(cargar: () => Promise<T[]>, cantidad = 2) {
  const [datos, setDatos] = useState<T[] | null>(null);

  useEffect(() => {
    let vigente = true;
    cargar()
      .then((lista) => {
        if (vigente) setDatos(lista.slice(0, cantidad));
      })
      .catch(() => {
        if (vigente) setDatos([]);
      });
    return () => {
      vigente = false;
    };
  }, [cargar, cantidad]);

  return datos;
}

function linea(partes: Array<string | undefined>) {
  return partes.filter(Boolean).join(" · ");
}

function BloqueCampanas() {
  const campanas = usePrimeros<SolicitudAyuda>(listarSolicitudes);
  if (!campanas || campanas.length === 0) return null;
  return (
    <Bloque titulo="Campañas activas" enlace="/la-mano" etiquetaEnlace="La Mano">
      {campanas.map((c) => (
        <article key={c.id}>
          <p className="text-sm leading-snug font-medium text-foreground">{c.titulo}</p>
          <p className="text-xs text-muted-foreground">
            {linea([c.categoria, c.ubicacion, c.fecha])}
          </p>
        </article>
      ))}
    </Bloque>
  );
}

function BloqueOportunidades() {
  const oportunidades = usePrimeros<Trabajo>(listarTrabajos);
  if (!oportunidades || oportunidades.length === 0) return null;
  return (
    <Bloque titulo="Oportunidades" enlace="/taller" etiquetaEnlace="El Taller">
      {oportunidades.map((o) => (
        <article key={o.id}>
          <p className="text-sm leading-snug font-medium text-foreground">{o.titulo}</p>
          <p className="text-xs text-muted-foreground">
            {linea([o.autor.nombreVisible, o.ubicacion])}
          </p>
        </article>
      ))}
    </Bloque>
  );
}

function BloqueComunidades() {
  const grupos = usePrimeros<Grupo>(listarGrupos);
  if (!grupos || grupos.length === 0) return null;
  return (
    <Bloque titulo="Comunidades" enlace="/mi-barrio" etiquetaEnlace="Mi Barrio">
      {grupos.map((g) => (
        <article key={g.id}>
          <p className="text-sm leading-snug font-medium text-foreground">{g.nombre}</p>
          <p className="text-xs text-muted-foreground">
            {linea([`${g.miembros.toLocaleString("es")} miembros`, g.barrio])}
          </p>
        </article>
      ))}
    </Bloque>
  );
}

function BloqueNegocios() {
  const negocios = usePrimeros<Negocio>(listarNegocios);
  if (!negocios || negocios.length === 0) return null;
  return (
    <Bloque titulo="Negocios" enlace="/colmena" etiquetaEnlace="La Colmena">
      {negocios.map((n) => (
        <article key={n.slug}>
          <p className="text-sm leading-snug font-medium text-foreground">{n.nombre}</p>
          <p className="text-xs text-muted-foreground">{linea([n.categoria, n.direccion])}</p>
        </article>
      ))}
    </Bloque>
  );
}

export function PanelDerecho({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="space-y-4">
        <BloqueCampanas />
        <BloqueOportunidades />
        <BloqueComunidades />
        <BloqueNegocios />
      </div>
    </div>
  );
}
