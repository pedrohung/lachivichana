import { Link } from "@tanstack/react-router";
import { ArrowLeft, type LucideIcon } from "lucide-react";

import { AvisoDemo } from "@/components/app/AvisoDemo";
import { Button } from "@/components/ui/button";

export type VistaPrevia = { titulo: string; detalle: string };

export function PaginaEnPreparacion({
  nombre,
  icono: Icono,
  descripcion,
  vistaPrevia,
  etiquetaVistaPrevia = "Una muestra de lo que vivirá aquí",
}: {
  nombre: string;
  icono: LucideIcon;
  descripcion: string;
  vistaPrevia: VistaPrevia[];
  etiquetaVistaPrevia?: string;
}) {
  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-secondary text-primary">
            <Icono aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h1 className="texto-display truncate text-2xl font-bold text-primary">{nombre}</h1>
            <p className="text-sm text-muted-foreground">{descripcion}</p>
          </div>
        </div>
        <AvisoDemo corto className="mt-4" />
      </header>

      <section className="rounded-2xl border border-border bg-card p-5">
        <h2 className="text-sm font-semibold text-primary">{etiquetaVistaPrevia}</h2>
        <ul className="mt-3 space-y-3">
          {vistaPrevia.map((v) => (
            <li key={v.titulo} className="rounded-xl border border-border bg-muted/40 p-3">
              <p className="text-sm font-semibold text-foreground">{v.titulo}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{v.detalle}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-dashed border-border bg-card p-6 text-center">
        <p className="texto-display text-lg font-bold text-primary">
          Estamos preparando este camino
        </p>
        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
          Esta sección llegará completa en la próxima etapa. Mientras tanto, puedes seguir
          recorriendo El Malecón.
        </p>
        <Button asChild variant="contorno" size="sm" className="mt-4">
          <Link to="/malecon">
            <ArrowLeft aria-hidden="true" /> Volver a El Malecón
          </Link>
        </Button>
      </section>
    </div>
  );
}
