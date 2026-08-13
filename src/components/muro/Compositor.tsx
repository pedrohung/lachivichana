import { PenLine, Image as ImageIcon, BarChart3, Store, HandHeart, Hammer } from "lucide-react";
import { toast } from "sonner";

import { AvatarIniciales } from "@/components/app/Avatar";
import { useApp } from "@/components/app/contexto";
import { Button } from "@/components/ui/button";

const OPCIONES = [
  { clave: "publicacion", nombre: "Publicación", icono: PenLine },
  { clave: "foto", nombre: "Foto o vídeo", icono: ImageIcon },
  { clave: "encuesta", nombre: "Encuesta", icono: BarChart3 },
  { clave: "producto", nombre: "Producto", icono: Store },
  { clave: "ayuda", nombre: "Ayuda", icono: HandHeart },
  { clave: "empleo", nombre: "Empleo", icono: Hammer },
];

export function Compositor() {
  const { identidad, requiereCuenta } = useApp();

  const abrir = (nombre: string) => {
    if (!requiereCuenta()) return;
    toast("Compositor en preparación", {
      description: `Aquí se abrirá el formulario de «${nombre}». En esta demostración todavía no se publica nada.`,
    });
  };

  return (
    <section
      aria-label="Crear publicación"
      className="rounded-2xl border border-border bg-card p-4"
    >
      <div className="flex items-center gap-3">
        <AvatarIniciales iniciales={identidad.avatar} nombre={identidad.nombreVisible} />
        <button
          type="button"
          onClick={() => abrir("Publicación")}
          className="min-h-11 min-w-0 flex-1 rounded-full border border-border bg-muted/60 px-4 text-left text-sm text-muted-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          ¿Qué quieres compartir hoy?
        </button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Participando como{" "}
        <span className="font-semibold text-foreground">{identidad.nombreVisible}</span> ·{" "}
        {identidad.detalle}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {OPCIONES.map((o) => (
          <Button
            key={o.clave}
            type="button"
            variant="ghost"
            size="sm"
            className="h-9 rounded-full border border-border text-xs"
            onClick={() => abrir(o.nombre)}
          >
            <o.icono aria-hidden="true" />
            {o.nombre}
          </Button>
        ))}
      </div>
    </section>
  );
}
