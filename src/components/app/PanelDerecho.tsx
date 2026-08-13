import { Link } from "@tanstack/react-router";

import { CAMPANAS } from "@/datos/demo/mano";
import { OPORTUNIDADES } from "@/datos/demo/taller";
import { GRUPOS } from "@/datos/demo/barrios";
import { NEGOCIOS } from "@/datos/demo/colmena";
import { PROMOTORES } from "@/datos/demo/promotores";
import { Progress } from "@/components/ui/progress";

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

export function PanelDerecho({ className }: { className?: string }) {
  const campanas = CAMPANAS.slice(0, 2);
  const oportunidades = OPORTUNIDADES.slice(0, 2);
  const grupos = GRUPOS.slice(0, 2);
  const negocios = NEGOCIOS.slice(0, 2);
  const promotores = PROMOTORES.slice(0, 2);

  return (
    <div className={className}>
      <div className="space-y-4">
        <Bloque titulo="Campañas activas" enlace="/la-mano" etiquetaEnlace="La Mano">
          {campanas.map((c) => (
            <article key={c.id} className="space-y-2">
              <p className="text-sm leading-snug font-medium text-foreground">{c.titulo}</p>
              <Progress
                value={Math.round((c.recaudado / c.meta) * 100)}
                aria-label={`Avance de la campaña ${c.titulo}`}
              />
              <p className="text-xs text-muted-foreground">
                {Math.round((c.recaudado / c.meta) * 100)}% · {c.zona}
              </p>
            </article>
          ))}
        </Bloque>

        <Bloque titulo="Oportunidades" enlace="/taller" etiquetaEnlace="El Taller">
          {oportunidades.map((o) => (
            <article key={o.id}>
              <p className="text-sm leading-snug font-medium text-foreground">{o.titulo}</p>
              <p className="text-xs text-muted-foreground">
                {o.entidad} · {o.modalidad}
              </p>
            </article>
          ))}
        </Bloque>

        <Bloque titulo="Comunidades" enlace="/mi-barrio" etiquetaEnlace="Mi Barrio">
          {grupos.map((g) => (
            <article key={g.id}>
              <p className="text-sm leading-snug font-medium text-foreground">{g.nombre}</p>
              <p className="text-xs text-muted-foreground">
                {g.miembros.toLocaleString("es")} miembros · {g.categoria}
              </p>
            </article>
          ))}
        </Bloque>

        <Bloque titulo="Negocios" enlace="/colmena" etiquetaEnlace="La Colmena">
          {negocios.map((n) => (
            <article key={n.slug}>
              <p className="text-sm leading-snug font-medium text-foreground">{n.nombre}</p>
              <p className="text-xs text-muted-foreground">
                {n.sector} · {n.area}
              </p>
            </article>
          ))}
        </Bloque>

        <Bloque titulo="Promotores" enlace="/promotores" etiquetaEnlace="Ver red">
          {promotores.map((p) => (
            <article key={p.id}>
              <p className="text-sm leading-snug font-medium text-foreground">{p.nombrePublico}</p>
              <p className="text-xs text-muted-foreground">
                {p.zona} · {p.ayudasCompletadas} ayudas
              </p>
            </article>
          ))}
        </Bloque>
      </div>
    </div>
  );
}
