import { BadgeCheck, Star } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Anunciante } from "@/datos/tipos";
import { cn } from "@/lib/utils";

export const AVISO_VERIFICACION =
  "Esta identidad fue comprobada de forma privada. La verificación no garantiza una operación sin riesgos.";

export function InsigniaVerificado({ negocio }: { negocio?: boolean }) {
  return (
    <Popover>
      <PopoverTrigger
        className="inline-flex items-center gap-1 rounded-full border border-turquesa/40 bg-turquesa/10 px-2 py-0.5 text-[0.7rem] font-semibold text-[oklch(0.4_0.08_215)] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        aria-label={
          negocio ? "Negocio verificado: más información" : "Identidad verificada: más información"
        }
      >
        <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" />
        {negocio ? "Negocio verificado" : "Verificado"}
      </PopoverTrigger>
      <PopoverContent className="w-72 text-sm">{AVISO_VERIFICACION}</PopoverContent>
    </Popover>
  );
}

export function Estrellas({ valor, className }: { valor: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <Star aria-hidden="true" className="h-3.5 w-3.5 fill-sol text-sol" />
      <span className="text-xs font-semibold text-foreground">{valor.toFixed(1)}</span>
    </span>
  );
}

export function ResumenReputacion({ persona }: { persona: Anunciante }) {
  return (
    <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
      <div>
        <dt className="text-xs text-muted-foreground">Valoración media</dt>
        <dd className="font-semibold text-foreground">
          {persona.reputacion.toFixed(1)} / 5
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            ({persona.valoraciones})
          </span>
        </dd>
      </div>
      <div>
        <dt className="text-xs text-muted-foreground">Operaciones completadas</dt>
        <dd className="font-semibold text-foreground">{persona.operaciones ?? 0}</dd>
      </div>
      <div>
        <dt className="text-xs text-muted-foreground">En La Chivichana desde</dt>
        <dd className="font-semibold text-foreground">{persona.desde}</dd>
      </div>
      <div>
        <dt className="text-xs text-muted-foreground">Tiempo de respuesta</dt>
        <dd className="font-semibold text-foreground">
          {persona.tiempoRespuesta ?? "Sin datos todavía"}
        </dd>
      </div>
    </dl>
  );
}
