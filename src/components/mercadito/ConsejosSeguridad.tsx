import { ShieldCheck } from "lucide-react";

import { CONSEJOS_SEGURIDAD } from "@/datos/servicios";
import { cn } from "@/lib/utils";

export function ConsejosSeguridad({ className }: { className?: string }) {
  return (
    <section
      aria-labelledby="consejos-mercadito"
      className={cn("rounded-2xl border border-border bg-card p-5", className)}
    >
      <h2
        id="consejos-mercadito"
        className="texto-display flex items-center gap-2 text-base font-bold text-primary"
      >
        <ShieldCheck aria-hidden="true" className="h-5 w-5 text-turquesa" />
        Compra y colabora con cuidado
      </h2>
      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
        {CONSEJOS_SEGURIDAD.map((c) => (
          <li key={c} className="flex gap-2">
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-turquesa"
            />
            <span>{c}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        La Chivichana acompaña a la comunidad, pero no garantiza operaciones, vendedores ni
        productos. La decisión y el cuidado son siempre de las personas que participan.
      </p>
    </section>
  );
}
