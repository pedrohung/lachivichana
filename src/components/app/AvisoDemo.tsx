import { Info } from "lucide-react";

import { AVISO_DEMO } from "@/datos/config";
import { cn } from "@/lib/utils";

export function AvisoDemo({ className, corto }: { className?: string; corto?: boolean }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-xl border border-border bg-muted/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
    >
      <Info aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-turquesa" />
      <span>
        {corto
          ? "Estás explorando una demostración. Los perfiles, publicaciones y operaciones son ficticios."
          : AVISO_DEMO}
      </span>
    </p>
  );
}